# Generate a valid JWT token for testing
# Install-Module -Name JWTDetails -Scope CurrentUser -Force (if needed)

$JWT_SECRET = "bc68ca15ac49ff75208c5bc2e52e8fa5"

# Create header
$header = @{
    alg = "HS256"
    typ = "JWT"
} | ConvertTo-Json -Compress

# Create payload
$now = [int][double]::Parse((Get-Date -UFormat %s))
$exp = $now + 86400 # 24 hours

$payload = @{
    sub = "test-user"
    name = "Test User"
    iat = $now
    exp = $exp
} | ConvertTo-Json -Compress

# Base64 encode
$headerBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($header)).TrimEnd('=').Replace('+', '-').Replace('/', '_')
$payloadBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($payload)).TrimEnd('=').Replace('+', '-').Replace('/', '_')

# Create signature
$hmac = New-Object System.Security.Cryptography.HMACSHA256
$hmac.Key = [System.Text.Encoding]::UTF8.GetBytes($JWT_SECRET)
$signature = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes("$headerBase64.$payloadBase64"))
$signatureBase64 = [Convert]::ToBase64String($signature).TrimEnd('=').Replace('+', '-').Replace('/', '_')

# Combine
$token = "$headerBase64.$payloadBase64.$signatureBase64"

Write-Host "Generated JWT Token:" -ForegroundColor Green
Write-Host $token -ForegroundColor Yellow
Write-Host ""
Write-Host "Copy this token and update line 6 in test-chatbot.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or use this in your Authorization header:" -ForegroundColor Cyan
Write-Host "Authorization: Bearer $token" -ForegroundColor White
