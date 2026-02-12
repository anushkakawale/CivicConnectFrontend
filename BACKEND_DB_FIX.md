# 🔧 Backend Database Fix Required

## ⚠️ Issue
**Error:** `Data truncation: Data too long for column 'description' at row 1`

**Root Cause:** The `description` column in the `complaint_reports` table is too small to store user-submitted descriptions.

---

## ✅ Frontend Fix (COMPLETED)

Changed description validation:
```javascript
// BEFORE
description: Yup.string()
    .max(1000, 'Description must be under 1000 characters')

// AFTER  
description: Yup.string()
    .max(500, 'Description must be under 500 characters')
```

Also updated character counter:
```javascript
// BEFORE
{formik.values.description.length}/1000 characters

// AFTER
{formik.values.description.length}/500 characters
```

---

## 🔨 Backend Fix Required

You need to update the database schema to support longer descriptions.

### Option 1: Increase to VARCHAR(500)
**Recommended for immediate fix**

```sql
-- For MySQL/MariaDB
ALTER TABLE complaint_reports 
MODIFY COLUMN description VARCHAR(500) NOT NULL;

-- Verify change
DESCRIBE complaint_reports;
```

### Option 2: Increase to TEXT (Recommended Long-term)
**Best practice for long-form content**

```sql
-- For MySQL/MariaDB
ALTER TABLE complaint_reports 
MODIFY COLUMN description TEXT NOT NULL;

-- TEXT supports up to 65,535 characters
-- MEDIUMTEXT supports up to 16,777,215 characters (if needed)

-- Verify change
DESCRIBE complaint_reports;
```

---

## 📊 Current vs Recommended Schema

### Current (Likely)
```sql
CREATE TABLE complaint_reports (
    complaint_id BIGINT PRIMARY KEY,
    citizen_user_id BIGINT NOT NULL,
    description VARCHAR(255) NOT NULL,  -- ❌ TOO SMALL
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    reported_at TIMESTAMP,
    ...
);
```

### Recommended
```sql
CREATE TABLE complaint_reports (
    complaint_id BIGINT PRIMARY KEY,
    citizen_user_id BIGINT NOT NULL,
    description TEXT NOT NULL,  -- ✅ SUPPORTS LONG TEXT
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    reported_at TIMESTAMP,
    ...
);
```

---

## 🔍 How to Check Current Column Size

### MySQL/MariaDB
```sql
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = 'your_database_name'
    AND TABLE_NAME = 'complaint_reports'
    AND COLUMN_NAME = 'description';
```

### Expected Output
```
COLUMN_NAME | DATA_TYPE | CHARACTER_MAXIMUM_LENGTH | IS_NULLABLE
description | varchar   | 255                      | NO
```

---

## 🚀 Migration Steps

### Step 1: Backup Database
```bash
# MySQL backup
mysqldump -u username -p database_name complaint_reports > backup_complaint_reports.sql

# Or full database backup
mysqldump -u username -p database_name > backup_full.sql
```

### Step 2: Run Migration
```sql
-- Connect to database
mysql -u username -p database_name

-- Run ALTER statement
ALTER TABLE complaint_reports 
MODIFY COLUMN description TEXT NOT NULL;

-- Verify change
DESCRIBE complaint_reports;
```

### Step 3: Test
```sql
-- Test inserting long description
INSERT INTO complaint_reports 
    (citizen_user_id, complaint_id, description, latitude, longitude, reported_at)
VALUES 
    (1, 999999, REPEAT('Test description with many characters. ', 50), 18.5204, 73.8567, NOW());

-- Check if it worked
SELECT LENGTH(description) as desc_length FROM complaint_reports WHERE complaint_id = 999999;

-- Clean up test data
DELETE FROM complaint_reports WHERE complaint_id = 999999;
```

---

## 🔧 Spring Boot Entity Update (If Needed)

If you're using JPA/Hibernate, also update the entity:

### Before
```java
@Entity
@Table(name = "complaint_reports")
public class ComplaintReport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long complaintId;
    
    @Column(nullable = false)  // Defaults to VARCHAR(255)
    private String description;
    
    // ... other fields
}
```

### After
```java
@Entity
@Table(name = "complaint_reports")
public class ComplaintReport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long complaintId;
    
    @Column(nullable = false, columnDefinition = "TEXT")  // Explicitly TEXT
    private String description;
    
    // ... other fields
}
```

Or use @Lob annotation:
```java
@Lob
@Column(nullable = false)
private String description;
```

---

## 📝 Liquibase/Flyway Migration (If Using Migration Tool)

### Liquibase
**File:** `db/changelog/2026-02-10-increase-description-length.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
    http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.0.xsd">

    <changeSet id="2026-02-10-increase-description-length" author="admin">
        <modifyDataType 
            tableName="complaint_reports"
            columnName="description"
            newDataType="TEXT"/>
        <rollback>
            <modifyDataType 
                tableName="complaint_reports"
                columnName="description"
                newDataType="VARCHAR(255)"/>
        </rollback>
    </changeSet>
</databaseChangeLog>
```

### Flyway
**File:** `db/migration/V2026.02.10__increase_description_length.sql`
```sql
-- Increase description column size
ALTER TABLE complaint_reports 
MODIFY COLUMN description TEXT NOT NULL;
```

---

## 🧪 Testing After Migration

### Test 1: Short Description (Should Work)
```
Title: "Broken Street Light"
Description: "Street light is not working" (29 chars)
Expected: ✅ Success
```

### Test 2: Medium Description (Should Work)
```
Title: "Pothole on Main Road"
Description: "There is a large pothole near City Hospital..." (250 chars)
Expected: ✅ Success
```

### Test 3: Long Description (Should Work After Fix)
```
Title: "Multiple Issues on MG Road"
Description: "Detailed description with 500 characters..." (500 chars)
Expected: ✅ Success (was ❌ before fix)
```

---

## 📊 Data Type Comparison

| Type | Max Length | Storage | Use Case |
|------|-----------|---------|----------|
| VARCHAR(255) | 255 chars | Length + 1 byte | Short text ❌ |
| VARCHAR(500) | 500 chars | Length + 2 bytes | Medium text ✅ |
| TEXT | 65,535 chars | Length + 2 bytes | Long text ✅✅ |
| MEDIUMTEXT | 16MB | Length + 3 bytes | Very long text |
| LONGTEXT | 4GB | Length + 4 bytes | Extremely long |

**Recommendation:** Use **TEXT** for descriptions (supports up to ~65K chars)

---

## ⚠️ Important Notes

1. **Backup First**: Always backup before schema changes
2. **Downtime**: ALTER TABLE may lock table briefly
3. **Frontend Update**: Already done (limited to 500 chars)
4. **Future**: Can increase frontend to 1000-2000 chars after backend fix
5. **Indexing**: TEXT columns cannot be fully indexed (only first N chars)

---

## 🎯 Summary

**Problem:** Database column too small  
**Frontend Fix:** ✅ Reduced to 500 chars (temporary)  
**Backend Fix:** ⏳ Need to run SQL migration to TEXT  
**Final State:** Can support 500+ chars after backend update  

---

## 🚀 Quick Fix Command

```sql
-- Just copy and run this (after backup!)
ALTER TABLE complaint_reports MODIFY COLUMN description TEXT NOT NULL;
```

**That's it! After running this, complaints with longer descriptions will work.** 🎉

---

## 🔄 Optional: Increase Frontend Limit After Backend Fix

Once backend is updated to TEXT, you can optionally increase frontend limit:

```javascript
// In RegisterComplaintEnhanced.jsx
description: Yup.string()
    .min(20, 'Please provide more detail (min 20 chars)')
    .max(2000, 'Description must be under 2000 characters'),  // Increased

// Update character counter
{formik.values.description.length}/2000 characters
```

But **500 characters is reasonable** for most complaints. Keep it unless users specifically need more.
