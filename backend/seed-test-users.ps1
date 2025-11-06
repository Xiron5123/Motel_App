# Seed test users for testing
$baseUrl = "http://localhost:3000"

Write-Host "=== CREATING TEST USERS ===" -ForegroundColor Cyan

# 1. Register RENTER
Write-Host "`n1. Creating RENTER user..." -ForegroundColor Yellow
try {
    $renter = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body (@{
        email = "renter@test.com"
        password = "password123"
        name = "Test Renter"
        phone = "0901234567"
    } | ConvertTo-Json)
    Write-Host "✅ Renter created: $($renter.user.email)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Renter might already exist" -ForegroundColor Yellow
}

# 2. Register LANDLORD (as RENTER first)
Write-Host "`n2. Creating LANDLORD user..." -ForegroundColor Yellow
try {
    $landlordReg = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body (@{
        email = "landlord@test.com"
        password = "password123"
        name = "Test Landlord"
        phone = "0987654321"
    } | ConvertTo-Json)
    Write-Host "✅ User created: $($landlordReg.user.email)" -ForegroundColor Green
    
    # Login to get token
    $landlordLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = "landlord@test.com"
        password = "password123"
    } | ConvertTo-Json)
    
    # Upgrade to LANDLORD
    $upgrade = Invoke-RestMethod -Uri "$baseUrl/users/become-landlord" -Method Post -Headers @{
        Authorization = "Bearer $($landlordLogin.accessToken)"
    }
    Write-Host "✅ Upgraded to LANDLORD" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Landlord might already exist or already upgraded" -ForegroundColor Yellow
}

Write-Host "`n=== USERS READY ===" -ForegroundColor Cyan
Write-Host "Renter: renter@test.com / password123" -ForegroundColor White
Write-Host "Landlord: landlord@test.com / password123" -ForegroundColor White
