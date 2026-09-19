$ErrorActionPreference = "Stop"

Write-Output "--- 1. Testing Frontend Delivery ---"
$frontend = Invoke-WebRequest -Uri 'http://localhost:5173'
Write-Output "Frontend HTTP Status: $($frontend.StatusCode)"

Write-Output "`n--- 2. Testing Manager Authentication ---"
$mgrBody = @{
    email = "manager@keystone.demo"
    password = "password123"
} | ConvertTo-Json

$mgrLogin = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method Post -ContentType 'application/json' -Body $mgrBody
Write-Output "Login Successful!"
Write-Output "User: $($mgrLogin.fullName) [Role: $($mgrLogin.role)]"
Write-Output "Token: $($mgrLogin.token.Substring(0, 20))..."

$mgrHeaders = @{ Authorization = "Bearer $($mgrLogin.token)" }

Write-Output "`n--- 3. Testing Work Orders API ---"
$orders = Invoke-RestMethod -Uri 'http://localhost:8080/api/work-orders' -Headers $mgrHeaders
Write-Output "Total Work Orders: $($orders.totalElements)"
foreach ($wo in $orders.content | Select-Object -First 3) {
    Write-Output " - [$($wo.workOrderCode)] $($wo.title) | Status: $($wo.status) | Tech: $($wo.assignedTechnicianName)"
}

Write-Output "`n--- 4. Testing Work Order Detail #1 ---"
$wo1 = Invoke-RestMethod -Uri 'http://localhost:8080/api/work-orders/1' -Headers $mgrHeaders
Write-Output "Ticket: $($wo1.workOrderCode) - $($wo1.title)"
Write-Output "Site: $($wo1.siteName) ($($wo1.siteCity))"
Write-Output "SLA Target: $($wo1.slaStatus)"
Write-Output "Audit Timeline entries: $($wo1.statusHistory.Count)"
Write-Output "Consumed Parts count: $($wo1.partsUsed.Count)"

Write-Output "`n--- 5. Testing Parts Inventory API ---"
$parts = Invoke-RestMethod -Uri 'http://localhost:8080/api/parts' -Headers $mgrHeaders
Write-Output "Total Inventory Parts: $($parts.totalElements)"
foreach ($p in $parts.content | Select-Object -First 3) {
    Write-Output " - [$($p.sku)] $($p.name) | Qty: $($p.stockQuantity) | Cost: `$$($p.unitCost)"
}

Write-Output "`n--- 6. Testing Customer Portal Scoped Query ---"
$custBody = @{
    email = "customer1@keystone.demo"
    password = "password123"
} | ConvertTo-Json

$custLogin = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method Post -ContentType 'application/json' -Body $custBody
$custHeaders = @{ Authorization = "Bearer $($custLogin.token)" }
$custRequests = Invoke-RestMethod -Uri 'http://localhost:8080/api/customer/work-orders' -Headers $custHeaders
Write-Output "Customer $($custLogin.fullName) Requests: $($custRequests.totalElements)"
foreach ($req in $custRequests.content) {
    Write-Output " - [$($req.workOrderCode)] $($req.title) | Tech: $($req.assignedTechnicianName) | Status: $($req.status)"
}

Write-Output "`n--- 7. Testing State Machine (ON_HOLD -> ASSIGNED) Unlocked Transition ---"
# Dispatcher reassigns WO #7 (which is ON_HOLD)
$dispBody = @{
    email = "dispatcher@keystone.demo"
    password = "password123"
} | ConvertTo-Json
$dispLogin = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method Post -ContentType 'application/json' -Body $dispBody
$dispHeaders = @{ Authorization = "Bearer $($dispLogin.token)" }

$transBody = @{
    targetStatus = "ASSIGNED"
    note = "Dispatcher reassigned job to Sarah Chen"
} | ConvertTo-Json
$reassigned = Invoke-RestMethod -Uri 'http://localhost:8080/api/work-orders/7/status' -Method Post -Headers $dispHeaders -ContentType 'application/json' -Body $transBody
Write-Output "WO #7 transition completed! New Status: $($reassigned.status)"

Write-Output "`n=== ALL LIVE END-TO-END TESTS PASSED SUCCESSFULLY! ==="
