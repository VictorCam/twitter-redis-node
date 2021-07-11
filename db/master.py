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

#configure postgresql files
file = open("../../etc/postgresql/13/main/pg_hba.conf", "a")
file.write("host all puser 172.17.0.1/32 md5\n")
file.close()
file = open("../../etc/postgresql/13/main/postgresql.conf", "a")
file.write('listen_addresses = \'localhost,' + get_ip_address("eth0") + '\'\n')
file.close()

#use port for apache2
apache2_conf_dir = "../../etc/apache2/ports.conf"
port_apache2_id = raw_input("enter unique port@apache2: ")
replace(apache2_conf_dir, "Listen 80", "Listen " + port_apache2_id)

#setup scripts
os.system('/usr/pgadmin4/bin/setup-web.sh')
os.system("su postgres")
# os.system("psql < master.sql")

# #restart service files that were edited
os.system('systemctl restart postgresql')
os.system('systemctl restart apache2')

print("==[DONE]==")