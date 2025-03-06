# 🔥 How to Deploy with Terraform

## 1️⃣ Initialize Terraform
```sh
terraform init
```

## 2️⃣ Plan the Deployment
```sh
terraform plan
```

## 3️⃣ Apply the Changes
```sh
terraform apply -auto-approve
```

---

# How to Get the IP Address

## 🔹 Option 1: Use AWS CLI
Run this command to get the ENI (Elastic Network Interface) details:
```sh
aws ecs list-tasks --cluster project021-cluster
```
This will return the Task ARN. Use that Task ARN in the next command:

```sh
aws ecs describe-tasks --cluster project021-cluster --tasks <TASK_ARN>
```
Look for the ENI ID (`eni-xxxxxxxxxxxxxxxxx`) in the output.

Then, get the public IP with:
```sh
aws ec2 describe-network-interfaces --network-interface-ids <ENI_ID> --query "NetworkInterfaces[0].Association.PublicIp" --output text
```

now hit the ip address in your browser
```sh
http://54.241.182.158:4000/
```