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
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200-399"  # Accept any 2XX or 3XX as healthy
  }
}

# ALB Listener
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