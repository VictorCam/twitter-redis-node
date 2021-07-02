FROM jrei/systemd-debian:latest

# update packages
RUN apt-get update || apt-get install apt-file -y || apt-file update

# installs
RUN apt install vim curl wget git -y
RUN apt install postgresql -y

RUN apt install gnupg2 -y
RUN curl https://www.pgadmin.org/static/packages_pgadmin_org.pub | apt-key add
RUN sh -c 'echo "deb https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/$(lsb_release -cs) pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list && apt update'
RUN apt install pgadmin4 -y
# /usr/pgadmin4/bin/setup-web.sh

# bashrc & vim setup
COPY rc_files/ ./root
RUN . ./root/.bashrc

#curl https://www.pgadmin.org/static/packages_pgadmin_org.pub | apt-key add


# RUN MANUALLY


# === [NOTES] ===

# docker run -p 80:80/tcp -p 5432:5432/tcp -d --name u1 --tmpfs /tmp --tmpfs /run --tmpfs /run/lock -v /sys/fs/cgroup:/sys/fs/cgroup:ro devian:latest

# docker run -p 82:82/tcp -p 3302:3306/tcp -d --name u2 --tmpfs /tmp --tmpfs /run --tmpfs /run/lock -v /sys/fs/cgroup:/sys/fs/cgroup:ro devian:latest

# ip addr show 172.17.0.2/16
# ss -twln
# systemctl --type=service

# /usr/pgadmin4/bin/setup-web.sh
# alter role postgres with password 'test';

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