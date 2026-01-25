<?php

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\SearchService;
use App\Models\Centro;
use App\Models\CicloFp;
use Illuminate\Support\Facades\DB;

$service = new SearchService();

echo "--- Testing SearchService ---\n";

// 1. Test basic filter (Provincia)
// Mocking data query construction, not executing against empty DB if local.
// But we can check if SQL is built correctly.

$filters = ['provincia' => 'Valladolid'];
$query = $service->buildQuery($filters);
$sql = $query->toSql();
echo "Filter 'provincia': " . (str_contains($sql, 'provincia') ? "PASS" : "FAIL") . "\n";

// 2. Test FP Filter logic
$filters = ['tipo' => 'FP', 'familia' => 'Informática'];
$query = $service->buildQuery($filters);
$sql = $query->toSql();
// Check if whereExists (whereHas) is applied
echo "Filter 'FP' (exists check): " . (str_contains($sql, 'exists') ? "PASS" : "FAIL") . "\n";

// 3. Test Geo Filter (Haversine)
$filters = ['lat' => 41.6, 'lng' => -4.7, 'radio' => 10];
$query = $service->buildQuery($filters);
$sql = $query->toSql();
echo "Filter 'Geo' (haversine formula): " . (str_contains($sql, '6371 * acos') ? "PASS" : "FAIL") . "\n";

echo "--- Done ---\n";
