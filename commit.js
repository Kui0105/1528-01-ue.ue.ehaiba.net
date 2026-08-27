/**
 * 自动提交脚本
 * 用法：node commit.js <fix|feat|feat!> "提交说明"
 * 规则：fix +0.0.1，feat +0.1.0，feat! +1.0.0
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const cwd = process.cwd();
const pkgPath = path.join(cwd, 'package.json');

const type = process.argv[2];
const message = process.argv[3];

if (!type || !message) {
  console.error('用法：node commit.js <fix|feat|feat!> "提交说明"');
  process.exit(1);
}

if (!['fix', 'feat', 'feat!'].includes(type)) {
  console.error('类型必须是 fix / feat / feat!');
  process.exit(1);
}

// 读取并更新版本号
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const [major, minor, patch] = pkg.version.split('.').map(Number);
let newMajor = major, newMinor = minor, newPatch = patch;
if (type === 'fix') newPatch = patch + 1;
if (type === 'feat') { newMinor = minor + 1; newPatch = 0; }
if (type === 'feat!') { newMajor = major + 1; newMinor = 0; newPatch = 0; }
const newVersion = `${newMajor}.${newMinor}.${newPatch}`;
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

// git 提交
const tag = `${type}: ${message} v${newVersion}`;
console.log(`正在提交：${tag}`);
execSync('git add .', { cwd, stdio: 'inherit' });
try {
  execSync(`git commit -m "${tag}"`, { cwd, stdio: 'inherit' });
} catch (e) {
  console.log('没有变更需要提交，或提交失败');
  process.exit(0);
}
execSync('git push origin main', { cwd, stdio: 'inherit' });
console.log(`✅ 已推送：${tag}`);
