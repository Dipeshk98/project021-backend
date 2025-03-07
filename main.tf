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
    }
  ])
}

# ✅ Create an ECS Service
resource "aws_ecs_service" "ecs_service" {
  name            = "project021-service"
  cluster         = aws_ecs_cluster.ecs_cluster.id
  task_definition = aws_ecs_task_definition.ecs_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = ["subnet-0a8d3b2c34d4e9329", "subnet-0ac2c7330f9607de6"]
    security_groups = ["sg-058641925a8a0ded0"]
    assign_public_ip = true
  }
}