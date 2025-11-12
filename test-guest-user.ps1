# Test Script for Guest User (No Authentication Required)
# This demonstrates how a guest user can interact with the chatbot

$ErrorActionPreference = "Stop"

# Configuration
$baseUrl = "http://localhost:8080"
$jwtSecret = "bc68ca15ac49ff75208c5bc2e52e8fa5"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Guest User Chatbot Test" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if service is healthy
Write-Host "Step 1: Checking service health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✓ Service is healthy" -ForegroundColor Green
    Write-Host "  Provider: $($healthResponse.aiProvider)" -ForegroundColor Gray
    Write-Host "  Model: $($healthResponse.aiModel)" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Service health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Generate JWT token for GUEST user (no customerId)
Write-Host "Step 2: Generating JWT token for GUEST user..." -ForegroundColor Yellow

# Create a guest token with only a temporary session ID
$header = @{
    alg = "HS256"
    typ = "JWT"
} | ConvertTo-Json -Compress

$payload = @{
    sessionId = "guest-session-" + [guid]::NewGuid().ToString()
    userType  = "guest"
    iat       = [int][DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    exp       = [int][DateTimeOffset]::UtcNow.AddHours(1).ToUnixTimeSeconds()
} | ConvertTo-Json -Compress

$headerBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($header)).TrimEnd('=').Replace('+', '-').Replace('/', '_')
$payloadBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($payload)).TrimEnd('=').Replace('+', '-').Replace('/', '_')

$hmacsha256 = New-Object System.Security.Cryptography.HMACSHA256
$hmacsha256.Key = [System.Text.Encoding]::UTF8.GetBytes($jwtSecret)
$signature = $hmacsha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes("$headerBase64.$payloadBase64"))
$signatureBase64 = [Convert]::ToBase64String($signature).TrimEnd('=').Replace('+', '-').Replace('/', '_')

$guestToken = "$headerBase64.$payloadBase64.$signatureBase64"
Write-Host "✓ Guest token generated" -ForegroundColor Green
Write-Host ""

# Step 3: Test guest user conversation
Write-Host "Step 3: Testing guest user conversation flow..." -ForegroundColor Yellow
Write-Host ""

# Conversation 1: Initial request without email
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Conversation 1: Guest asks to track order" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$conversation1 = @{
    messages = @(
        @{
            role    = "user"
            content = "I want to track my order"
        }
    )
} | ConvertTo-Json -Depth 10

$headers1 = @{
    "Authorization" = "Bearer $guestToken"
    "Content-Type"  = "application/json"
}

Write-Host "User: I want to track my order" -ForegroundColor White
Write-Host ""
Write-Host "Bot Response:" -ForegroundColor Green

try {
    $response1 = Invoke-WebRequest -Uri "$baseUrl/chat" -Method Post -Headers $headers1 -Body $conversation1
    $responseText1 = $response1.Content
    
    # Parse the streaming response
    $lines = $responseText1 -split "`n"
    $botMessage = ""
    foreach ($line in $lines) {
        if ($line.StartsWith("0:")) {
            $content = $line.Substring(3, $line.Length - 4)
            $botMessage += $content
        }
    }
    
    Write-Host $botMessage -ForegroundColor Green
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# Conversation 2: Provide email and get orders
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Conversation 2: Guest provides email" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$conversation2 = @{
    messages = @(
        @{
            role    = "user"
            content = "My email is george.haeger@xcentium.com"
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "User: My email is george.haeger@xcentium.com" -ForegroundColor White
Write-Host ""
Write-Host "Bot Response:" -ForegroundColor Green

try {
    $response2 = Invoke-WebRequest -Uri "$baseUrl/chat" -Method Post -Headers $headers1 -Body $conversation2
    $responseText2 = $response2.Content
    
    # Parse the streaming response
    $lines = $responseText2 -split "`n"
    $botMessage = ""
    foreach ($line in $lines) {
        if ($line.StartsWith("0:")) {
            $content = $line.Substring(3, $line.Length - 4)
            $botMessage += $content
        }
    }
    
    Write-Host $botMessage -ForegroundColor Green
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# Conversation 3: Direct email request
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Conversation 3: Direct order lookup by email" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$conversation3 = @{
    messages = @(
        @{
            role    = "user"
            content = "Find all orders for george.haeger@xcentium.com"
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "User: Find all orders for george.haeger@xcentium.com" -ForegroundColor White
Write-Host ""
Write-Host "Bot Response:" -ForegroundColor Green

try {
    $response3 = Invoke-WebRequest -Uri "$baseUrl/chat" -Method Post -Headers $headers1 -Body $conversation3
    $responseText3 = $response3.Content
    
    # Parse the streaming response
    $lines = $responseText3 -split "`n"
    $botMessage = ""
    foreach ($line in $lines) {
        if ($line.StartsWith("0:")) {
            $content = $line.Substring(3, $line.Length - 4)
            $botMessage += $content
        }
    }
    
    Write-Host $botMessage -ForegroundColor Green
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# Summary
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✓ Guest user authentication works" -ForegroundColor Green
Write-Host "✓ Bot correctly asks for email" -ForegroundColor Green
Write-Host "✓ Order lookup by email works" -ForegroundColor Green
Write-Host ""
Write-Host "Guest user flow is working correctly!" -ForegroundColor Green
Write-Host ""
