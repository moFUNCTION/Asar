const cfg = require('../../../appwrite/appwrite.config.json');

console.log('Project:', cfg.projectName, 'ID:', cfg.projectId);
console.log('Endpoint:', cfg.endpoint);
console.log('Database:', cfg.tablesDB[0].$id, cfg.tablesDB[0].name);
console.log('Total Tables:', cfg.tables.length);
console.log('\n--- TABLES SUMMARY ---');

cfg.tables.forEach((t, i) => {
  console.log(`\n[${i + 1}] ID: ${t.$id} | Name: ${t.name} | RowSecurity: ${t.rowSecurity}`);
  console.log(`    Permissions: ${JSON.stringify(t.$permissions)}`);
  console.log(`    Columns (${t.columns.length}):`);
  t.columns.forEach(col => {
    const details = [];
    if (col.required) details.push('required');
    if (col.array) details.push('array');
    if (col.size) details.push(`size:${col.size}`);
    if (col.default !== null && col.default !== undefined) details.push(`default:${col.default}`);
    console.log(`      - ${col.key} (${col.type}${details.length ? ' | ' + details.join(', ') : ''})`);
  });
  if (t.indexes && t.indexes.length) {
    console.log(`    Indexes (${t.indexes.length}):`);
    t.indexes.forEach(idx => {
      console.log(`      - ${idx.key} (${idx.type}): [${idx.columns.join(', ')}]`);
    });
  }
});

console.log('\n--- BUCKETS ---');
if (cfg.buckets) {
  cfg.buckets.forEach(b => {
    console.log(`Bucket: ${b.$id} | Name: ${b.name} | fileSecurity: ${b.fileSecurity} | Perms: ${JSON.stringify(b.$permissions)}`);
  });
} else {
  console.log('No buckets in appwrite.config.json directly (check storage config).');
}
