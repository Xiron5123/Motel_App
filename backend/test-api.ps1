# Test Auth API

Write-Host "🧪 Testing Auth API..." -ForegroundColor Cyan

# 1. Register
Write-Host "`n1️⃣ Testing Register..." -ForegroundColor Yellow
$registerBody = @{
    name = "Test User"
    email = "test@example.com"
    password = "Password123!"
    role = "RENTER"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✅ Register successful!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.user.id)"
    Write-Host "Email: $($registerResponse.user.email)"
    $accessToken = $registerResponse.accessToken
    $refreshToken = $registerResponse.refreshToken
} catch {
    Write-Host "❌ Register failed: $_" -ForegroundColor Red
    exit
}

# 2. Login
Write-Host "`n2️⃣ Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "test@example.com"
    password = "Password123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    $accessToken = $loginResponse.accessToken
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
}

# 3. Get Me
Write-Host "`n3️⃣ Testing Get Current User..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $accessToken"
    }
    $meResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/me" -Method Get -Headers $headers
    Write-Host "✅ Get Me successful!" -ForegroundColor Green
    Write-Host "Name: $($meResponse.name)"
    Write-Host "Email: $($meResponse.email)"
    Write-Host "Role: $($meResponse.role)"
} catch {
    Write-Host "❌ Get Me failed: $_" -ForegroundColor Red
}

Write-Host "`n✅ All tests completed!" -ForegroundColor Green
