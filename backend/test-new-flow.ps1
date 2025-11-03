# Test New User Flow (Option 2)

Write-Host "🧪 Testing New User Flow..." -ForegroundColor Cyan

# 1. Register (default RENTER, no role selection)
Write-Host "`n1️⃣ Testing Register (default RENTER)..." -ForegroundColor Yellow
$registerBody = @{
    name = "Alice Nguyen"
    email = "alice@example.com"
    password = "Password123!"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✅ Register successful!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.user.id)"
    Write-Host "Email: $($registerResponse.user.email)"
    Write-Host "Role: $($registerResponse.user.role)" -ForegroundColor Cyan
    $accessToken = $registerResponse.accessToken
} catch {
    Write-Host "❌ Register failed: $_" -ForegroundColor Red
    exit
}

# 2. Get Profile
Write-Host "`n2️⃣ Testing Get Profile..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $accessToken"
    }
    $profileResponse = Invoke-RestMethod -Uri "http://localhost:3000/users/me" -Method Get -Headers $headers
    Write-Host "✅ Get Profile successful!" -ForegroundColor Green
    Write-Host "Name: $($profileResponse.name)"
    Write-Host "Role: $($profileResponse.role)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Get Profile failed: $_" -ForegroundColor Red
}

# 3. Update Profile (add phone)
Write-Host "`n3️⃣ Testing Update Profile (add phone)..." -ForegroundColor Yellow
$updateBody = @{
    phone = "0123456789"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:3000/users/me" -Method Patch -Headers $headers -Body $updateBody -ContentType "application/json"
    Write-Host "✅ Update Profile successful!" -ForegroundColor Green
    Write-Host "Phone: $($updateResponse.phone)"
} catch {
    Write-Host "❌ Update Profile failed: $_" -ForegroundColor Red
}

# 4. Become Landlord
Write-Host "`n4️⃣ Testing Become Landlord..." -ForegroundColor Yellow
$landlordBody = @{
    reason = "Tôi muốn cho thuê phòng trọ tại Hà Nội"
} | ConvertTo-Json

try {
    $landlordResponse = Invoke-RestMethod -Uri "http://localhost:3000/users/become-landlord" -Method Post -Headers $headers -Body $landlordBody -ContentType "application/json"
    Write-Host "✅ Become Landlord successful!" -ForegroundColor Green
    Write-Host "Message: $($landlordResponse.message)"
    Write-Host "New Role: $($landlordResponse.user.role)" -ForegroundColor Magenta
} catch {
    Write-Host "❌ Become Landlord failed: $_" -ForegroundColor Red
}

# 5. Verify Role Changed
Write-Host "`n5️⃣ Verifying Role Changed..." -ForegroundColor Yellow
try {
    $verifyResponse = Invoke-RestMethod -Uri "http://localhost:3000/users/me" -Method Get -Headers $headers
    Write-Host "✅ Verification successful!" -ForegroundColor Green
    Write-Host "Current Role: $($verifyResponse.role)" -ForegroundColor Magenta
    
    if ($verifyResponse.role -eq "LANDLORD") {
        Write-Host "`n🎉 SUCCESS! User is now a LANDLORD!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ WARNING: Role not updated correctly!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Verification failed: $_" -ForegroundColor Red
}

Write-Host "`n✅ All tests completed!" -ForegroundColor Green
