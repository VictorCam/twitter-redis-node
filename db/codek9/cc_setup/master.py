import fileinput
import sys
import os
import socket
import fcntl
import struct

print("running tasks... [MASTER]")

def get_ip_address(ifname):
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    return socket.inet_ntoa(fcntl.ioctl(
        s.fileno(),
        0x8915,  # SIOCGIFADDR
        struct.pack('256s', ifname[:15])
    )[20:24])

def replace(file,searchExp,replaceExp):
    for line in fileinput.input(file, inplace=1):
        if searchExp in line:
            line = line.replace(searchExp,replaceExp)
        sys.stdout.write(line)

# port_maria_id = input("enter unique port@mariadb: ") use docker (in meantime) to bind unique port (3301:3306)

#assign server-id, bind-address, and log_bin for mariadb
maria_conf_dir = "../../etc/mysql/mariadb.conf.d/50-server.cnf"
server1_mariadb_ip = get_ip_address('eth0')
server_maria_id = raw_input("enter unique server-id@mariadb: ")
replace(maria_conf_dir, "bind-address", "bind-address = " + server1_mariadb_ip + " #")
replace(maria_conf_dir, "#server-id", "server-id =" + server_maria_id + " #")
replace(maria_conf_dir, "#log_bin", "log_bin = /var/log/mysql/mysql-bin.log #")

#use port for apache2
apache2_conf_dir = "../../etc/apache2/ports.conf"
port_apache2_id = raw_input("enter unique port@apache2: ") # make sure to bind with docker (81:81)
replace(apache2_conf_dir, "Listen 80", "Listen " + port_apache2_id)

#edit sql master file for passwords and ip assignment
master_sql_dir = "../../cc_setup/sql/master.sql"
server2_mariadb_ip = raw_input("what is the IP of your SLAVE?: ")
root_maria_pass = raw_input("enter strong password for root@mariadb: ")
user_maria_pass = raw_input("enter strong password for user@mariadb: ")
replica_maria_pass = raw_input("enter strong password for replica@mariadb: ")
replace(master_sql_dir, "root@mariadb", root_maria_pass)
replace(master_sql_dir, "user@mariadb", user_maria_pass)
replace(master_sql_dir, "replica@mariadb", replica_maria_pass)
replace(master_sql_dir, "replica_IP@mariadb", server2_mariadb_ip)

#restart service files that were edited
os.system('systemctl restart mariadb')
os.system('systemctl restart apache2')

#run edited configuration
os.system('mysql < ~/../cc_setup/sql/master.sql')

print("==[DONE]==")