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

#use port for apache2
apache2_conf_dir = "../../etc/apache2/ports.conf"
port_apache2_id = raw_input("enter unique port@apache2: ") # make sure to bind with docker (81:81)
replace(apache2_conf_dir, "Listen 80", "Listen " + port_apache2_id)

#edit sql master file for passwords and ip assignment

#restart service files that were edited
os.system('systemctl restart mariadb')
os.system('systemctl restart apache2')

# os.system("echo 'test' >> test.sql")

print("==[DONE]==")