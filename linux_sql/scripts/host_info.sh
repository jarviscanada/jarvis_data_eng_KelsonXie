psql_host=$1
psql_port=$2
db_name=$3
psql_user=$4
psql_password=$5

if [ "$#" -ne 5 ]; then
    echo "Illegal number of parameters"
    exit 1
fi

lscpu_out=$(lscpu)
hostname=$(hostname -f)

export PGPASSWORD=$psql_password
host_exists=$(psql -h $psql_host -p $psql_port -d $db_name -U $psql_user \
    -t -A -c "SELECT 1 FROM host_info WHERE hostname='$hostname' LIMIT 1;")

if [ "$host_exists" = "1" ]; then
    echo "host_info entry already exists for hostname: $hostname"
    exit 0
fi

cpu_number=$(echo "$lscpu_out"  | egrep "^CPU\(s\):" | awk '{print $2}' | xargs)
cpu_architecture=$(echo "$lscpu_out" | egrep "^Architecture:" | awk '{print $2}' | xargs)
cpu_model=$(echo "$lscpu_out" | egrep "^Model name:" | awk -F': +' '/Model name/ {print $2}' | xargs)
cpu_mhz=$(echo "$cpu_model" | awk '
  match($0, /([0-9]+\.[0-9]+|[0-9]+)(G|M)Hz/, a) {
    if (a[2] == "G") print a[1] * 1000;
    else print a[1];
  }')
l2_cache=$(lscpu | egrep "^L2 cache:" | awk '{print $3}'|xargs)
total_mem=$(grep MemTotal /proc/meminfo | awk '{print $2}')
timestamp=$(date +"%Y-%m-%d %H:%M:%S")

insert_stmt="INSERT INTO host_info\
(hostname, cpu_number, cpu_architecture, \
cpu_model, cpu_mhz, l2_cache, \"timestamp\", total_mem)\
VALUES('$hostname', $cpu_number, '$cpu_architecture', \
'$cpu_model', $cpu_mhz, $l2_cache, '$timestamp', $total_mem);"

psql -h $psql_host -p $psql_port -d $db_name -U $psql_user -c "$insert_stmt"
exit $?