<?php
// verify_code.php
header('Content-Type: application/json; charset=utf-8');

// URL de redirection (non utilisée côté serveur ici, mais utile pour info)
const FORM_URL = 'https://forms.office.com/Pages/ResponsePage.aspx?id=ubYqTlKuj0uiHMaGpDEjuL3Khzo--jZEpWsfCWFKgi9UMjFWRUU2V045VTlZOVRQWk8wTTVCSjFLVi4u';

// fichier CSV (même dossier)
$CSV_PATH = __DIR__ . '/codes.csv';

// Méthode POST uniquement
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

// Récupère le code envoyé
$code = $_POST['code'] ?? '';
$code = trim($code);
if ($code === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Code manquant']);
    exit;
}

// Normalisation (compare sans casse)
$code_norm = mb_strtoupper($code, 'UTF-8');

// Vérifie que le fichier existe
if (!is_file($CSV_PATH) || !is_readable($CSV_PATH)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Fichier codes introuvable ou non lisible']);
    exit;
}

// Ouvre le fichier en lecture/écriture
$fp = fopen($CSV_PATH, 'c+');
if (!$fp) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Impossible d\'ouvrir le fichier codes']);
    exit;
}

// Verrou exclusif (empêche les race conditions)
if (!flock($fp, LOCK_EX)) {
    fclose($fp);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Impossible d\'obtenir le verrou sur le fichier']);
    exit;
}

// Lit tout le CSV
rewind($fp);
$rows = [];
while (($data = fgetcsv($fp, 4096, ';')) !== false) {
    // fgetcsv retourne FALSE si fin de fichier ; peut retourner array vide pour lignes vides
    if ($data === null) continue;
    // Si ligne vide (ex: dernière lignes avec ;;), skip
    if (count($data) === 1 && trim($data[0]) === '') continue;
    $rows[] = $data;
}

// Si pas d'entête, renvoyer erreur
if (count($rows) === 0) {
    // on libère le verrou
    flock($fp, LOCK_UN);
    fclose($fp);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Fichier codes vide ou mal formé']);
    exit;
}

// Recherche du code (tolérance : colonne A = code, colonne B = used)
$foundIndex = -1;
$header = $rows[0];
for ($i = 1; $i < count($rows); $i++) {
    $rowCode = isset($rows[$i][0]) ? trim($rows[$i][0]) : '';
    if ($rowCode === '') continue;
    if (mb_strtoupper($rowCode, 'UTF-8') === $code_norm) {
        $foundIndex = $i;
        break;
    }
}

if ($foundIndex === -1) {
    // pas trouvé -> log et renvoyer
    // on libère le verrou
    flock($fp, LOCK_UN);
    fclose($fp);
    http_response_code(200);
    echo json_encode(['success' => false, 'message' => 'Code introuvable']);
    exit;
}

// Vérifie used (col 2)
$usedVal = isset($rows[$foundIndex][1]) ? trim($rows[$foundIndex][1]) : '';
if (mb_strtoupper($usedVal, 'UTF-8') === 'TRUE' || mb_strtoupper($usedVal, 'UTF-8') === '1' ) {
    // déjà utilisé
    flock($fp, LOCK_UN);
    fclose($fp);
    http_response_code(200);
    echo json_encode(['success' => false, 'message' => 'Ce code a déjà été utilisé']);
    exit;
}

// Si on est là : code valide et non utilisé -> on le marque comme TRUE
$rows[$foundIndex][1] = 'TRUE';                    // used
$rows[$foundIndex][2] = date('c');                 // timestamp ISO
$rows[$foundIndex][3] = $_SERVER['REMOTE_ADDR'] ?? ''; // ip (optionnel)

// Écrit tout le CSV proprement : on tronque et on réécrit
rewind($fp);
ftruncate($fp, 0);

// Écrire chaque ligne (en respectant le séparateur ;)
foreach ($rows as $r) {
    // s'assurer que la ligne a au moins 2 colonnes
    if (!isset($r[0])) $r[0] = '';
    if (!isset($r[1])) $r[1] = '';
    // fputcsv utilise , par défaut -> on force le delimiter ';'
    fputcsv($fp, $r, ';');
}

fflush($fp);
// Libère le lock et ferme
flock($fp, LOCK_UN);
fclose($fp);

// Réponse succès
http_response_code(200);
echo json_encode(['success' => true, 'message' => 'Code validé']);
exit;
