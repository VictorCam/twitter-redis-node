FROM jrei/systemd-debian:latest

# update packages
RUN apt-get update || apt-get install apt-file -y || apt-file update

# installs
RUN apt install vim curl wget git -y
RUN apt install mariadb-server mariadb-client mariadb-plugin-rocksdb -y
RUN apt install apache2 php libapache2-mod-php php-curl php-cli php-mysql php-gd -y

# download adminer / setup
RUN wget http://www.adminer.org/latest.php -O ~/../var/www/html/latest.php
COPY ./adminer_plugins/ ~/../var/www/html/

# bashrc & vim setup
COPY rc_files/ ./root
RUN . ./root/.bashrc

# copy files
COPY codek9 ~/../


# RUN MANUALLY
# python master.py
# python slave.py
# mysql_secure_installation (optional: there are more if you type mysql)


# === [NOTES] ===

# docker run -p 81:81/tcp -p 3301:3306/tcp -d --name u1 --tmpfs /tmp --tmpfs /run --tmpfs /run/lock -v /sys/fs/cgroup:/sys/fs/cgroup:ro devian:latest

# docker run -p 82:82/tcp -p 3302:3306/tcp -d --name u2 --tmpfs /tmp --tmpfs /run --tmpfs /run/lock -v /sys/fs/cgroup:/sys/fs/cgroup:ro devian:latest

# ip addr show 172.17.0.2/16
# ss -twln
# systemctl --type=service

# ==== [LATER REFERENCE] =====

# https://medium.com/tech-learn-share/docker-mysql-access-denied-for-user-172-17-0-1-using-password-yes-c5eadad582d3
# https://mariadb.com/kb/en/standard-replication/
# https://linuxize.com/post/how-to-configure-mysql-master-slave-replication-on-debian-10/

#https://mariadb.com/kb/en/getting-started-with-myrocks/

#https://www.shellhacks.com/mysql-show-users-privileges-passwords/

#https://techviewleo.com/how-to-install-mariadb-on-alpine-linux/
#https://wiki.alpinelinux.org/wiki/Production_DataBases_:_mysql#Configuration_files

#https://www.interserver.net/tips/kb/how-to-install-adminer-in-centos/

#https://www.journaldev.com/29314/set-up-mariadb-master-slave-replication-centos