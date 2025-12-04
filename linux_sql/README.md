# Linux Cluster Monitoring Project
# Introduction
(about 100-150 words)
Discuss the design of the project. What does this project/product do? Who are the users? What are the technologies you have used? (e.g. bash, docker, git, etc..)
This project is designed to monitor usage and data of Linux nodes, extracting the host info and usage using bash scripts, cron jobs and storing them in a docker container that runs postgres.
The codebase managed on Git version control and follows the GitFlow branching model. The project is intended to help the Jarvis Linux Cluster Administration manage their Linux clusters.

# Quick Start
Use markdown code block for your quick-start commands
- Start a psql instance using psql_docker.sh
- Create tables using ddl.sql
- Insert hardware specs data into the DB using host_info.sh
- Insert hardware usage data into the DB using host_usage.sh
- Crontab setup
```
# start a psql instance to host database
./scripts/psql_docker.sh create db_username db_password
./scripts/psql_docker.sh start

# create postgres tables in docker
psql -h localhost -U postgres -d database -f sql/ddl.sql

# insert hardware specs data into the newly created tables (make sure you have a database created beforehand)
./scripts/host_info.sh psql_host psql_port db_name psql_user psql_password

# insert hardware usage data into the newly created tables
./scripts/host_usage.sh psql_host psql_port db_name psql_user psql_password

# setup cron job for host_usage.sh to gather data every minute
crontab -e
* * * * * bash /pwd/of/host_usage.sh psql_host psql_port db_name psql_user psql_password
```

# Implemenation
Discuss how you implement the project.
## Architecture
Draw a cluster diagram with three Linux hosts, a DB, and agents (use draw.io website). Image must be saved to the `assets` directory.

## Scripts
Shell script description and usage (use markdown code block for script usage)
- psql_docker.sh
- host_info.sh
- host_usage.sh
- crontab
- queries.sql (describe what business problem you are trying to resolve)

## Database Modeling
Describe the schema of each table using markdown table syntax (do not put any sql code)
- `host_info`
- `host_usage`

# Test
How did you test your bash scripts DDL? What was the result?

# Deployment
How did you deploy your app? (e.g. Github, crontab, docker)

# Improvements
Write at least three things you want to improve 
e.g. 
- handle hardware updates 
- blah
- blah
