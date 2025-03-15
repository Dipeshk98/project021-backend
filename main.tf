provider "aws" {
  region = "us-west-1"
}

# ✅ Create an ECS Cluster
resource "aws_ecs_cluster" "ecs_cluster" {
  name = "project021-cluster"
}

# ✅ Define an ECS Task Definition (Using Existing IAM Role)
resource "aws_ecs_task_definition" "ecs_task" {
  family                   = "project021-backend-task"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = "arn:aws:iam::843365213176:role/ecsTaskExecutionRole" # Use your existing IAM role

  container_definitions = jsonencode([
    {
      name  = "project021-backend"
      image = "843365213176.dkr.ecr.us-west-1.amazonaws.com/main-backend:latest"
      portMappings = [
        {
          containerPort = 4000
          hostPort      = 4000
        }
      ]
      # Add logging configuration
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/project021-backend"
          "awslogs-region"        = "us-west-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# Create CloudWatch log group
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/project021-backend"
  retention_in_days = 30
}

# Create security group for the ALB
resource "aws_security_group" "alb_sg" {
  name        = "project021-alb-sg"
  description = "Security group for the ALB"
  
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
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Update the ECS security group to only allow traffic from the ALB
# Fix the ECS security group
resource "aws_security_group" "ecs_sg" {
  name        = "project021-ecs-sg"
  description = "Security group for ECS tasks"
  
  # Allow traffic from the ALB to port 4000
  ingress {
    from_port       = 4000
    to_port         = 4000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
    description     = "Allow traffic from ALB to container port"
  }
  
  # For testing purposes, you can also add direct access 
  # (remove this after testing if not needed)
  ingress {
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow direct access to container port for testing"
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Create an Application Load Balancer
resource "aws_lb" "backend_alb" {
  name               = "project021-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = ["subnet-0a8d3b2c34d4e9329", "subnet-0ac2c7330f9607de6"]
  
  enable_deletion_protection = false
}

# Create ALB target group
resource "aws_lb_target_group" "backend_tg" {
  name        = "project021-tg"
  port        = 4000
  protocol    = "HTTP"
  vpc_id      = "vpc-0a20efc55fab4f2aa" # Replace with your VPC ID
  target_type = "ip"
  
  health_check {
    enabled             = true
    interval            = 30
    path                = "/" # Update this to a valid health check endpoint
    port                = "traffic-port"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    protocol            = "HTTP"
    matcher             = "200-399" # Acceptable HTTP response codes
  }
}

# Create ALB listener
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.backend_alb.arn
  port              = 80
  protocol          = "HTTP"
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_tg.arn
  }
}

# ✅ Update the ECS Service to use the ALB
resource "aws_ecs_service" "ecs_service" {
  name            = "project021-service"
  cluster         = aws_ecs_cluster.ecs_cluster.id
  task_definition = aws_ecs_task_definition.ecs_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  
  # Add load balancer configuration
  load_balancer {
    target_group_arn = aws_lb_target_group.backend_tg.arn
    container_name   = "project021-backend"
    container_port   = 4000
  }

  network_configuration {
    subnets         = ["subnet-0a8d3b2c34d4e9329", "subnet-0ac2c7330f9607de6"]
    security_groups = [aws_security_group.ecs_sg.id] # Use the new security group
    assign_public_ip = true
  }
  
  # Ensure the ALB is created before the service
  depends_on = [aws_lb_listener.http]
}

# Output the ALB DNS name
output "alb_dns_name" {
  value       = aws_lb.backend_alb.dns_name
  description = "The DNS name of the load balancer"
}