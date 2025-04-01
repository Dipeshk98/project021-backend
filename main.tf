# Certificate ARN reference
variable "certificate_arn" {
  description = "ARN of the ACM certificate"
  type        = string
  default     = "arn:aws:acm:us-west-1:843365213176:certificate/876e436c-62f6-49f9-9d22-2e54105a43ef"
}


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
  region = "us-west-1"  # Based on subnet IDs which appear to be in us-west-1
}

# ECS Cluster
resource "aws_ecs_cluster" "ecs_cluster" {
  name = "MyECSCluster"
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/MyTask"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "frontend_logs" {
  name              = "/ecs/MyFrontendTask"
  retention_in_days = 30
}

# ECS Task Definition
resource "aws_ecs_task_definition" "task_definition" {
  family                   = "MyTask"
  cpu                      = "512"  # Increased from 256 to 512
  memory                   = "1024" # Increased from 512 to 1024
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = "arn:aws:iam::843365213176:role/ecsTaskExecutionRole"

  container_definitions = jsonencode([
    {
      name         = "MyContainer"
      image        = "843365213176.dkr.ecr.us-west-1.amazonaws.com/main-backend:latest"
      portMappings = [
        {
          containerPort = 4000
          protocol      = "tcp"
        }
      ],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          "awslogs-group"         = "/ecs/MyTask",
          "awslogs-region"        = "us-west-1",
          "awslogs-stream-prefix" = "ecs",
          "awslogs-create-group"  = "true"
        }
      },
      essential = true
    }
  ])
}

# Security Groups
resource "aws_security_group" "alb_sg" {
  name        = "ALBSecurityGroup"
  description = "ALB Security Group"
  vpc_id      = "vpc-0a20efc55fab4f2aa"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Terraform requires an egress rule
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ecs_sg" {
  name        = "ECSSecurityGroup"
  description = "ECS Security Group"
  vpc_id      = "vpc-0a20efc55fab4f2aa"

  ingress {
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Application Load Balancer
resource "aws_lb" "application_lb" {
  name               = "MyALB"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = ["subnet-0a8d3b2c34d4e9329", "subnet-0ac2c7330f9607de6"]

  idle_timeout = 60
}

resource "aws_lb_target_group" "target_group" {
  name        = "MyTargetGroup"
  port        = 4000
  protocol    = "HTTP"
  vpc_id      = "vpc-0a20efc55fab4f2aa"
  target_type = "ip"
  
  health_check {
    path                = "/health"  # Use a path your application actually responds to
    interval            = 60
    timeout             = 10
    healthy_threshold   = 2
    unhealthy_threshold = 5
    matcher             = "200-399"  # Accept any 2XX or 3XX as healthy
  }
}

# ALB Listener for Backend (HTTP only)
resource "aws_lb_listener" "alb_listener" {
  load_balancer_arn = aws_lb.application_lb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.target_group.arn
  }
}

# ECS Service
resource "aws_ecs_service" "ecs_service" {
  name            = "MyService"
  cluster         = aws_ecs_cluster.ecs_cluster.id
  task_definition = aws_ecs_task_definition.task_definition.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = ["subnet-0a8d3b2c34d4e9329", "subnet-0ac2c7330f9607de6"]
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.target_group.arn
    container_name   = "MyContainer"
    container_port   = 4000
  }

  # This is needed to prevent racing condition with target group
  depends_on = [aws_lb_listener.alb_listener]
}

# Output
output "alb_endpoint" {
  description = "ALB URL"
  value       = aws_lb.application_lb.dns_name
}

# ECS Task Definition for Frontend ------------------------------------------------------------------------------------
resource "aws_ecs_task_definition" "frontend_task" {
  family                   = "MyFrontendTask"
  cpu                      = "1024"
  memory                   = "3072"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = "arn:aws:iam::843365213176:role/ecsTaskExecutionRole"

  container_definitions = jsonencode([
    {
      name         = "MyFrontendContainer"
      image        = "843365213176.dkr.ecr.us-west-1.amazonaws.com/project021-frontend:latest"
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          "awslogs-group"         = "/ecs/MyFrontendTask",
          "awslogs-region"        = "us-west-1",
          "awslogs-stream-prefix" = "ecs"
        }
      },
      essential = true
    }
  ])
  depends_on = [aws_cloudwatch_log_group.frontend_logs] # Ensure log group exists first
}

# Security Group for Frontend ALB
resource "aws_security_group" "frontend_alb_sg" {
  name        = "FrontendALBSecurityGroup"
  description = "Frontend ALB Security Group"
  vpc_id      = "vpc-0a20efc55fab4f2aa"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Frontend ALB
resource "aws_lb" "frontend_alb" {
  name               = "MyFrontendALB"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.frontend_alb_sg.id]
  subnets            = ["subnet-0a8d3b2c34d4e9329", "subnet-0ac2c7330f9607de6"]

  idle_timeout = 60
}

resource "aws_lb_target_group" "frontend_target_group" {
  name        = "MyFrontendTargetGroup"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = "vpc-0a20efc55fab4f2aa"
  target_type = "ip"

  health_check {
    path                = "/"
    interval            = 60
    timeout             = 10
    healthy_threshold   = 2
    unhealthy_threshold = 5
    matcher             = "200-399"
  }
}

# HTTP -> HTTPS Redirect for Frontend
resource "aws_lb_listener" "frontend_http_listener" {
  load_balancer_arn = aws_lb.frontend_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# HTTPS Listener for Frontend
resource "aws_lb_listener" "frontend_https_listener" {
  load_balancer_arn = aws_lb.frontend_alb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_target_group.arn
  }
}

# ECS Service for Frontend
resource "aws_ecs_service" "frontend_service" {
  name            = "MyFrontendService"
  cluster         = aws_ecs_cluster.ecs_cluster.id
  task_definition = aws_ecs_task_definition.frontend_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = ["subnet-0a8d3b2c34d4e9329", "subnet-0ac2c7330f9607de6"]
    security_groups  = [aws_security_group.frontend_alb_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend_target_group.arn
    container_name   = "MyFrontendContainer"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.frontend_https_listener]
}

# Output for Frontend ALB
output "frontend_alb_endpoint" {
  description = "Frontend ALB URL"
  value       = aws_lb.frontend_alb.dns_name
}

