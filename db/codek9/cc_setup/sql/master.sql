ALTER USER 'root'@'localhost' IDENTIFIED BY 'root@mariadb';

CREATE USER 'user'@'172.17.0.1' IDENTIFIED BY 'user@mariadb';
GRANT ALL PRIVILEGES on *.* TO 'user'@'172.17.0.1';

-- use the ip from SLAVE machine
CREATE USER 'replica'@'replica_IP@mariadb' IDENTIFIED BY 'replica@mariadb';
GRANT REPLICATION SLAVE ON *.* TO 'replica'@'replica_IP@mariadb';

FLUSH PRIVILEGES;

SHOW MASTER STATUS\G