# ✅ DONOR REPOSITORY FIX - JPQL Query Corrected

## Problem
The Spring Boot application failed to start with this error:
```
Could not resolve attribute 'donorId' of 'com.itc.demo.entity.DonorAppeal'
```

The JPQL query in `DonorRepository.findDonorsByAppealId()` was trying to access `da.donorId` and `da.appealId`, but the `DonorAppeal` entity uses JPA relationships (`donor` and `appeal` objects), not raw ID fields.

## Root Cause
**File:** `src/main/java/com/itc/demo/repository/DonorRepository.java`

**OLD (BROKEN) Query:**
```java
@Query("SELECT d FROM Donor d WHERE d.id IN (SELECT da.donorId FROM DonorAppeal da WHERE da.appealId = :appealId)")
List<Donor> findDonorsByAppealId(@Param("appealId") Long appealId);
```

**Issue:** 
- `da.donorId` and `da.appealId` don't exist as fields
- `DonorAppeal` has `da.donor` (relationship) and `da.appeal` (relationship) instead

## Solution Applied

**NEW (FIXED) Query:**
```java
@Query("SELECT DISTINCT d FROM DonorAppeal da JOIN da.donor d WHERE da.appeal.id = :appealId")
List<Donor> findDonorsByAppealId(@Param("appealId") Long appealId);
```

**What Changed:**
- `FROM DonorAppeal da JOIN da.donor d` - Joins the relationship correctly
- `da.appeal.id = :appealId` - Accesses the appeal ID through the relationship
- `SELECT DISTINCT d` - Returns only the donor objects

## Files Modified

✅ **File:** `src/main/java/com/itc/demo/repository/DonorRepository.java`
- Updated the @Query annotation to use proper JPQL with object relationships

## How to Apply

1. **Option A (Recommended) - Automatic:**
   ```bash
   # The fix has been applied to the repository
   cd C:\Users\Admin\Downloads\donation-management-backend-main\demo
   ```

2. **Option B - Manual Fix:**
   Open: `src/main/java/com/itc/demo/repository/DonorRepository.java`
   
   Replace:
   ```java
   @Query("SELECT d FROM Donor d WHERE d.id IN (SELECT da.donorId FROM DonorAppeal da WHERE da.appealId = :appealId)")
   ```
   
   With:
   ```java
   @Query("SELECT DISTINCT d FROM DonorAppeal da JOIN da.donor d WHERE da.appeal.id = :appealId")
   ```

## Next Steps

1. **Compile:**
   ```bash
   mvn clean install -DskipTests
   ```

2. **Run:**
   ```bash
   mvn spring-boot:run
   ```

3. **Expected Result:**
   - Application starts successfully ✓
   - No more "Could not resolve attribute 'donorId'" error ✓
   - Donor Communication feature works ✓

## Related Files (For Reference)

- ✅ `src/main/java/com/itc/demo/entity/DonorAppeal.java` - Uses `donor` and `appeal` objects
- ✅ `src/main/java/com/itc/demo/entity/Donor.java` - JPA entity
- ✅ `src/main/java/com/itc/demo/entity/Appeal.java` - JPA entity
- ✅ `src/main/java/com/itc/demo/service/impl/CommunicationServiceImpl.java` - Uses the fixed query

## Testing the Fix

After compilation, verify:

1. Application starts: **Should see "Tomcat started on port..."**
2. Add a donor: POST http://localhost:5000/api/donors
3. Link donor to appeal: INSERT INTO donor_appeals (donor_id, appeal_id) VALUES (1, 1)
4. Send email: POST http://localhost:5000/communications/send

All should work without JPQL errors!
