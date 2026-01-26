# Todo Web Application - Backup and Recovery Procedures

## Table of Contents
1. [Overview](#overview)
2. [Backup Strategies](#backup-strategies)
3. [Database Backup](#database-backup)
4. [Application Backup](#application-backup)
5. [Recovery Procedures](#recovery-procedures)
6. [Disaster Recovery Plan](#disaster-recovery-plan)
7. [Testing Backup and Recovery](#testing-backup-and-recovery)
8. [Maintenance and Monitoring](#maintenance-and-monitoring)

## Overview

This document outlines the backup and recovery procedures for the Todo Web Application. The procedures ensure data integrity, minimize downtime, and enable rapid recovery in case of system failures or data loss.

### Objectives
- Protect critical application data
- Ensure business continuity
- Minimize data loss and recovery time
- Maintain compliance with data retention policies
- Establish clear recovery procedures

### Scope
This document covers:
- Database backup and recovery
- Application configuration backup
- File storage backup (if applicable)
- Recovery procedures for different failure scenarios
- Testing and validation of backup systems

## Backup Strategies

### Types of Backups

#### 1. Full Database Backup
- Complete backup of the PostgreSQL database
- Performed daily during low-traffic periods
- Retention: 30 days of daily backups, weekly backups for 6 months

#### 2. Incremental Backup
- Backup of changes since last full backup
- Performed hourly during business hours
- Retention: 7 days of incremental backups

#### 3. Configuration Backup
- Application configuration files
- Environment variables and secrets
- Infrastructure as Code (IaC) files
- Performed daily with full backup

#### 4. File Storage Backup
- User-uploaded files (if applicable)
- Log files (for analysis)
- Performed daily during full backup

### Backup Schedule

| Backup Type | Frequency | Time | Retention |
|-------------|-----------|------|-----------|
| Full Database | Daily | 02:00 AM | 30 days |
| Incremental Database | Hourly | Every hour | 7 days |
| Configuration | Daily | 02:00 AM | 90 days |
| File Storage | Daily | 02:30 AM | 30 days |

## Database Backup

### PostgreSQL Backup Methods

#### 1. pg_dump (Logical Backup)
```bash
# Full backup command
pg_dump -h hostname -U username -d database_name -Fc > backup_file.dump

# Example for production
pg_dump -h localhost -U postgres -d todo_db -Fc > /backups/todo_db_$(date +%Y%m%d_%H%M%S).dump
```

#### 2. File System Level Backup (Physical Backup)
```bash
# Stop PostgreSQL service
sudo systemctl stop postgresql

# Copy data directory
sudo rsync -av /var/lib/postgresql/data/ /backup/postgresql/

# Start PostgreSQL service
sudo systemctl start postgresql
```

#### 3. Continuous Archiving (WAL Shipping)
Configure PostgreSQL for continuous archiving:
```conf
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'
```

### Automated Backup Script

Create a backup script for automated execution:

```bash
#!/bin/bash
# backup_script.sh

# Configuration
DB_NAME="todo_db"
DB_USER="postgres"
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform backup
pg_dump -U $DB_USER -d $DB_NAME -Fc > $BACKUP_DIR/todo_db_$DATE.dump

# Compress backup
gzip $BACKUP_DIR/todo_db_$DATE.dump

# Remove old backups
find $BACKUP_DIR -name "todo_db_*.dump.gz" -mtime +$RETENTION_DAYS -delete

# Log backup operation
echo "$(date): Backup completed for $DB_NAME" >> /var/log/backup.log
```

### Backup Verification

#### 1. Integrity Check
```bash
# Verify dump file integrity
pg_restore --list backup_file.dump.gz
```

#### 2. Test Restore
```bash
# Restore to test database
createdb test_restore_db
pg_restore -d test_restore_db backup_file.dump.gz
```

## Application Backup

### Configuration Backup

#### Environment Variables
```bash
# Backup environment files
cp /app/backend/.env /backups/config/backend_env_$(date +%Y%m%d).bak
cp /app/frontend/.env.local /backups/config/frontend_env_$(date +%Y%m%d).bak
```

#### Docker Configuration
```bash
# Backup Docker Compose files
cp /app/docker-compose.yml /backups/config/docker_compose_$(date +%Y%m%d).bak
cp /app/backend/Dockerfile /backups/config/backend_dockerfile_$(date +%Y%m%d).bak
cp /app/frontend/Dockerfile /backups/config/frontend_dockerfile_$(date +%Y%m%d).bak
```

### Application Code Backup

#### Version Control
```bash
# Ensure all changes are committed
git add .
git commit -m "Backup before $(date)"
git push origin main
```

#### Archive Method
```bash
# Create application archive
tar -czf /backups/app/todo_app_$(date +%Y%m%d).tar.gz /app/
```

## Recovery Procedures

### Database Recovery

#### 1. Full Database Recovery
```bash
# Stop application services
docker-compose down

# Restore database
gunzip -c backup_file.dump.gz | pg_restore -d todo_db -c

# Start application services
docker-compose up -d
```

#### 2. Point-in-Time Recovery (PITR)
```bash
# Restore from base backup
pg_restore -d todo_db base_backup.dump

# Apply WAL files up to specific point
pg_rewind --target-pgdata /var/lib/postgresql/data --source-server='host=standby port=5432 dbname=todo_db'
```

#### 3. Single Table Recovery
```bash
# Restore specific table from backup
pg_restore -d todo_db --table=table_name backup_file.dump
```

### Application Recovery

#### 1. Configuration Recovery
```bash
# Restore environment files
cp /backups/config/backend_env_YYYYMMDD.bak /app/backend/.env
cp /backups/config/frontend_env_YYYYMMDD.bak /app/frontend/.env.local
```

#### 2. Application Code Recovery
```bash
# Restore from version control
git checkout main
git reset --hard commit_hash

# Or restore from archive
tar -xzf todo_app_YYYYMMDD.tar.gz -C /app/
```

## Disaster Recovery Plan

### Recovery Scenarios

#### Scenario 1: Database Corruption
**Impact**: High - Application unavailable, potential data loss
**RTO**: 2 hours
**RPO**: 1 hour (for incremental backups)

**Steps**:
1. Assess extent of corruption
2. Stop application services
3. Restore from latest full backup
4. Apply incremental backups up to point before corruption
5. Verify data integrity
6. Start application services
7. Notify stakeholders

#### Scenario 2: Server Failure
**Impact**: High - Complete service outage
**RTO**: 4 hours
**RPO**: 1 hour

**Steps**:
1. Provision new server
2. Install required software (PostgreSQL, Docker, etc.)
3. Restore database from backup
4. Deploy application code
5. Configure environment
6. Start services
7. Verify functionality
8. Update DNS if needed

#### Scenario 3: Data Center Outage
**Impact**: Critical - Complete service unavailability
**RTO**: 6 hours
**RPO**: 15 minutes (if replication configured)

**Steps**:
1. Activate secondary data center
2. Restore from latest backup
3. Update DNS to point to secondary location
4. Verify all services are operational
5. Monitor for issues

### Recovery Team Roles

| Role | Responsibility |
|------|----------------|
| Recovery Coordinator | Overall coordination and communication |
| Database Administrator | Database restoration and verification |
| System Administrator | Infrastructure restoration |
| Application Developer | Application restoration and testing |
| Network Administrator | Network and connectivity restoration |

## Testing Backup and Recovery

### Regular Testing Schedule

#### Monthly Tests
- Database backup integrity verification
- Test restore to non-production environment
- Verify application functionality after restore

#### Quarterly Tests
- Full disaster recovery simulation
- Cross-team recovery drill
- Documentation review and update

### Test Procedures

#### 1. Backup Integrity Test
```bash
# Verify backup file integrity
pg_restore --list backup_file.dump.gz

# Check for corruption
md5sum backup_file.dump.gz
```

#### 2. Recovery Test
```bash
# Create test database
createdb test_recovery_db

# Restore backup to test database
pg_restore -d test_recovery_db backup_file.dump.gz

# Verify data integrity
psql -d test_recovery_db -c "SELECT COUNT(*) FROM tasks;"
psql -d test_recovery_db -c "SELECT COUNT(*) FROM users;"

# Clean up
dropdb test_recovery_db
```

#### 3. Application Functionality Test
```bash
# Start application with restored database
docker-compose up -d

# Run smoke tests
curl -X GET http://localhost:8000/health
curl -X GET http://localhost:8000/health/database
```

## Maintenance and Monitoring

### Backup Monitoring

#### 1. Automated Monitoring Script
```bash
#!/bin/bash
# monitor_backups.sh

BACKUP_DIR="/backups"
THRESHOLD_DAYS=2
LOG_FILE="/var/log/backup_monitor.log"

# Check if backup was created today
TODAY_BACKUP=$(find $BACKUP_DIR -name "*$(date +%Y%m%d)*" -type f | wc -l)

if [ $TODAY_BACKUP -eq 0 ]; then
    echo "$(date): ERROR - No backup created today" >> $LOG_FILE
    # Send alert notification
    curl -X POST -d "alert=No backup created today" https://hooks.slack.com/services/...
else
    echo "$(date): OK - Backup created successfully" >> $LOG_FILE
fi
```

#### 2. Backup Size Monitoring
```bash
# Monitor backup sizes
BACKUP_SIZE=$(du -sh /backups | cut -f1)
SIZE_THRESHOLD="10G"

if [ $(echo "$BACKUP_SIZE > $SIZE_THRESHOLD" | bc -l) ]; then
    echo "Warning: Backup size exceeds threshold ($SIZE_THRESHOLD)"
fi
```

### Alerting and Notifications

#### 1. Backup Failure Alerts
- Email notifications to administrators
- Slack/Discord notifications to team channels
- SMS alerts for critical failures

#### 2. Recovery Time Alerts
- Alert if RTO is approaching
- Notification when recovery is complete
- Status updates during recovery process

### Documentation Updates

#### Regular Reviews
- Monthly: Review backup procedures
- Quarterly: Update disaster recovery plan
- Annually: Comprehensive plan review

#### Change Management
- Document all backup procedure changes
- Update runbooks and playbooks
- Train team members on new procedures

## Compliance and Reporting

### Backup Reports
- Daily backup status reports
- Weekly backup size trends
- Monthly backup performance metrics
- Quarterly disaster recovery test reports

### Audit Trail
- Log all backup operations
- Track recovery tests and results
- Document any incidents and resolutions
- Maintain compliance records

## Conclusion

This backup and recovery plan provides a comprehensive framework for protecting the Todo Web Application data and ensuring business continuity. Regular testing and updates to this plan are essential to maintain its effectiveness.

Remember to:
- Test backups regularly
- Keep documentation current
- Train team members on procedures
- Monitor backup systems continuously
- Review and update procedures periodically

For questions or clarifications about this backup and recovery plan, contact the system administrator or designated recovery coordinator.