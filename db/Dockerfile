FROM jrei/systemd-debian:latest

# update packages
RUN apt update || apt install apt-file -y || apt-file update

# install utilities
RUN apt install vim curl wget git openssh-server gnupg2 python -y

# append keys and apt files
RUN curl https://www.pgadmin.org/static/packages_pgadmin_org.pub | apt-key add
RUN curl https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ buster-pgdg main" | tee /etc/apt/sources.list.d/pgdg.list
RUN sh -c 'echo "deb https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/buster pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list && apt update'
RUN apt update

# download postgres database/tools
RUN apt install pgadmin4-web -y
RUN apt install postgresql-13 -y

# run manually
# su postgres
# psql -f file_with_sql.sql


# bashrc & vim setup
COPY rc_files/ ./root
COPY master.py ~/../
COPY master.sql ~/../
RUN . ./root/.bashrc


# RUN MANUALLY


# === [NOTES] ===

# docker run -p 80:80/tcp -p 5430:5430/tcp -d --name u1 --tmpfs /tmp --tmpfs /run --tmpfs /run/lock -v /sys/fs/cgroup:/sys/fs/cgroup:ro -v /pg_files:/var/lib/postgresql/13/main devian:latest

# docker run -p 81:81/tcp -p 5431:5431/tcp -d --name u2 --tmpfs /tmp --tmpfs /run --tmpfs /run/lock -v /sys/fs/cgroup:/sys/fs/cgroup:ro devian:latest

# ip addr show 172.17.0.2/16
# ss -twln
# systemctl --type=service

# /usr/pgadmin4/bin/setup-web.sh
# alter role postgres with password 'test';

# ==== [LATER REFERENCE] =====

# https://askubuntu.com/questions/385416/pg-ctl-command-not-found-what-package-has-this-command


# https://medium.com/tech-learn-share/docker-mysql-access-denied-for-user-172-17-0-1-using-password-yes-c5eadad582d3
# https://mariadb.com/kb/en/standard-replication/
# https://linuxize.com/post/how-to-configure-mysql-master-slave-replication-on-debian-10/

#https://mariadb.com/kb/en/getting-started-with-myrocks/

#https://www.shellhacks.com/mysql-show-users-privileges-passwords/

#https://techviewleo.com/how-to-install-mariadb-on-alpine-linux/
#https://wiki.alpinelinux.org/wiki/Production_DataBases_:_mysql#Configuration_files

#https://www.interserver.net/tips/kb/how-to-install-adminer-in-centos/

#https://www.journaldev.com/29314/set-up-mariadb-master-slave-replication-centos