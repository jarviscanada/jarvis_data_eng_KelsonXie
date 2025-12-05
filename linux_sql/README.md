# Linux Cluster Monitoring Project

# Introduction
This project is designed to monitor usage and data of Linux nodes, extracting the host info and usage using bash scripts, cron jobs and storing them in a docker container that runs postgres.
The codebase managed on Git version control and follows the GitFlow branching model. The project is intended to help the Jarvis Linux Cluster Administration manage their Linux clusters.

# Quick Start
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
This project is implemented using Linux command lines, Bash scripts, cron jobs, docker, PostgreSQL and the IntelliJ IDE

## Architecture
<img width="500" height="522" alt="LinuxClusterMonitoring" src="https://github.com/user-attachments/assets/20c84c59-8e6a-4205-9919-0281d3df9d12" />

- The Linux nodes are all connected by a physical Network Switch
- Each node runs Bash Scripts to gather server usage data and inserts it into the PostgreSQL instance
- The monitoring agent consists of two Bash Scripts:
  - host_info.sh gets hardware data of the Linux machine and only runs once, at install time
  - host_usage.sh gets usage data of the Linux machine and runs every minute by running a cron job

## Scripts
Shell script description and usage (use markdown code block for script usage)
- psql_docker.sh
  - A script used to create, start or stop the PostgreSQL docker container
  - ```
    # script usage
    ./scripts/psql_docker.sh start|stop|create [db_username][db_password]

    # example
    ./scripts/psql_docker.sh create db_username db_password
    ./scripts/psql_docker.sh start
    ./scripts/psql_docker.sh stop
    ```
- host_info.sh
  - A script used to record hardware information and insert it into PostgreSQL
  - ```
    # script usage
    ./scripts/host_info.sh psql_host psql_port db_name psql_user psql_password

    # example
    ./scripts/host_info.sh "localhost" 5432 "host_agent" "postgres" "password"
    ```
- host_usage.sh
  - A script used to record usage data and insert it into PostgreSQL
  - ```
     # script usage
    ./scripts/host_usage.sh psql_host psql_port db_name psql_user psql_password

    # example
    ./scripts/host_usage.sh "localhost" 5432 "host_agent" "postgres" "password"
    ```
- crontab
  - Sets up a cron job to run the host_usage.sh script every minute
- ddl.sql
  - Creates the necessary tables to store data for the Bash scripts you must run this in the PostgreSQL container
  - `psql -h psql_host -U psql_user -d db_name -f sql/ddl.sql`

## Database Modeling
- `host_info`

| id (PK) | hostname (Unique) | cpu_number | cpu_architecture | cpu_model | cpu_mhz | l2_cache | timestamp | total_mem |
| ------- | ----------------- | ---------- | ---------------- | --------- | ------- | -------- | --------- | --------- |
| SERIAL  | VARCHAR           | INT2       | VARCHAR          | VARCHAR   | FLOAT8  | INT4     | TIMESTAMP | INT4      |

- `host_usage`

| timestamp | host_id (FK) | memory_free | cpu_idle | cpu_kernel | disk_io | disk_available |
| --------- | ------------ | ----------- | -------- | ---------- | ------- | -------------- |
| TIMESTAMP | SERIAL       | INT4        | INT2     | INT2       | INT4    | INT4           |


# Test
Ran `bash -x` to enable execution tracing. Used it to verify the results of variable assignments, commands, expansions and substitutions. Before the data insertions, verified that the data format was correct and ran `SELECT * FROM HOST_INFO` and `SELECT * FROM HOST_USAGE` to make sure the data was successfully ingested

# Deployment
How did you deploy your app? (e.g. Github, crontab, docker)
- The entire project was broken down into multiple feature branches adhering to the GitFlow branching model in Git
- The PostgreSQL database is hosted in a docker container ran in one of the Linux nodes. The database has a mounted directory that stores persistent data locally in one of the Linux nodes
- A cron job was created to run the `host_usage.sh` script to grab usage data every minute and insert it into the PostgreSQL table

# Improvements
- Currently have no way to send data from other Linux nodes, will want to implement this feature in the future
- I'd like to have more standard unit testing for future code validation and and automated testing
- Perform some sort of data analysis on the data to get insights on the data usage for all the Linux nodes

