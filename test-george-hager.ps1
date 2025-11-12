# Test script for George Haeger customer lookup
# Tests the customer service chatbot with a specific customer email

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Customer Service Chatbot" -ForegroundColor Cyan
Write-Host "Customer: George Haeger (george.haeger@xcentium.com)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://localhost:8080"
$jwtToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3NjI4NzMzNjIsInN1YiI6InRlc3QtdXNlciIsIm5hbWUiOiJUZXN0IFVzZXIiLCJpYXQiOjE3NjI3ODY5NjJ9.qSJyHDzju3SFRMQVD6Ui9hwtaWRqKQz4lFITI_ZgXrs"

# Test 1: Health Check
Write-Host "Step 1: Checking server health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -ErrorAction Stop
    Write-Host "✓ Server is healthy!" -ForegroundColor Green
    Write-Host "  Provider: $($healthResponse.aiProvider)" -ForegroundColor Gray
    Write-Host "  Model: $($healthResponse.aiModel)" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Server is not responding. Please ensure Docker container is running:" -ForegroundColor Red
    Write-Host "  Run: docker-compose up -d" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Lookup George Haeger by email and get orders
Write-Host "Step 2: Looking up customer by email 'george.haeger@xcentium.com' and retrieving orders..." -ForegroundColor Yellow
Write-Host ""

$body = @{
    messages = @(
        @{
            role    = "user"
            content = "Find all orders for customer with email george.haeger@xcentium.com"
        }
    )
} | ConvertTo-Json -Depth 10

$headers = @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer $jwtToken"
}

try {
    Write-Host "Sending request to AI assistant..." -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri "$baseUrl/chat" -Method Post -Body $body -Headers $headers -TimeoutSec 60
    
    Write-Host "✓ Request successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "AI Assistant Response:" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host $response -ForegroundColor White
    Write-Host ""
}
catch {
    Write-Host "✗ Request failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "1. Verify JWT_SECRET in .env matches the token generation" -ForegroundColor Gray
    Write-Host "2. Check OpenAI API key is valid and has credits" -ForegroundColor Gray
    Write-Host "3. Verify commercetools credentials are correct" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
