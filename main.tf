# Configure S3 backend for state management
terraform {
  backend "s3" {
    bucket = "project021-backend-terraform-state"
    key    = "project021-backend/terraform.tfstate"
    region = "us-west-1"
  }
}

# AWS Provider
provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-1"
}

variable "container_image" {
  description = "Docker image to use for the container"
  type        = string
}

variable "app_port" {
  description = "Port exposed by the docker image"
  type        = number
  default     = 4000
}

variable "desired_count" {
  description = "Number of ECS tasks to run"
  type        = number
  default     = 1
}

variable "vpc_id" {
  description = "VPC ID where resources will be deployed"
  type        = string
  default     = "vpc-0a20efc55fab4f2aa"
}

variable "subnet_ids" {
  description = "Subnet IDs for ECS tasks and ALB"
  type        = list(string)
  default     = ["subnet-0a8d3b2c34d4e9329", "subnet-0ac2c7330f9607de6"]
}

variable "execution_role_arn" {
  description = "ARN of the IAM role for ECS task execution"
  type        = string
  default     = "arn:aws:iam::843365213176:role/ecsTaskExecutionRole"
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "project021-backend-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/project021-backend"
  retention_in_days = 30
}

# Security Groups
resource "aws_security_group" "alb" {
  name        = "project021-backend-alb-sg"
  description = "Controls access to the ALB"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP traffic"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTPS traffic"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "project021-backend-alb-sg"
  }
}

resource "aws_security_group" "ecs_tasks" {
  name        = "project021-backend-ecs-sg"
  description = "Controls access to the ECS tasks"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = var.app_port
    to_port         = var.app_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "Allow inbound traffic from ALB"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "project021-backend-ecs-sg"
  }
}

# ALB
resource "aws_lb" "main" {
  name               = "project021-backend-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.subnet_ids
  
  enable_deletion_protection = false
  
  tags = {
    Name = "project021-backend-alb"
  }
}

# Target Group
resource "aws_lb_target_group" "main" {
  name        = "project021-backend-tg"
  port        = var.app_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"
  
  health_check {
    enabled             = true
    interval            = 30
    path                = "/health"  # Update to a valid health check path
    port                = "traffic-port"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    protocol            = "HTTP"
    matcher             = "200-399"
  }
  
  tags = {
    Name = "project021-backend-tg"
  }
}

# ALB Listener
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "main" {
  family                   = "project021-backend-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = var.execution_role_arn
  
  # Force new deployment on each apply by adding a timestamp to the task definition
  container_definitions = jsonencode([
    {
      name         = "project021-backend"
      image        = var.container_image
      essential    = true
      
      portMappings = [
        {
          containerPort = var.app_port
          hostPort      = var.app_port
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "DEPLOYMENT_TIMESTAMP"
          value = timestamp()
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# ECS Service
resource "aws_ecs_service" "main" {
  name                = "project021-backend-service"
  cluster             = aws_ecs_cluster.main.id
  task_definition     = aws_ecs_task_definition.main.arn
  desired_count       = var.desired_count
  launch_type         = "FARGATE"
  scheduling_strategy = "REPLICA"
  
  # Force new deployment on each apply
  force_new_deployment = true
  
  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = "project021-backend"
    container_port   = var.app_port
  }
  
  depends_on = [
    aws_lb_listener.http,
    aws_ecs_task_definition.main
  ]
  
  # Set deployment configuration for faster deployments
  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 50
}

# Outputs
output "alb_dns_name" {
  value       = aws_lb.main.dns_name
  description = "DNS name of the load balancer"
}

output "ecs_cluster_name" {
  value       = aws_ecs_cluster.main.name
  description = "Name of the ECS cluster"
}

output "ecs_service_name" {
  value       = aws_ecs_service.main.name
  description = "Name of the ECS service"
}
