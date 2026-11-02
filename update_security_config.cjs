const fs = require('fs');

const filePath = 'D:/Projects/app/src/main/java/com/realestate/app/security/SecurityConfig.java';

let content = fs.readFileSync(filePath, 'utf8');

// The origins we want to ensure are present
const vercelProd = 'https://realestate-p2ae825cp-dev-connect6.vercel.app';
const vercelWildcard = 'https://*.vercel.app';

console.log('--- ORIGINAL CONTENT START ---');
console.log(content);
console.log('--- ORIGINAL CONTENT END ---');

// Check if already present
if (content.includes(vercelProd)) {
  console.log('Vercel origin already exists in SecurityConfig.java');
  process.exit(0);
}

// Check common patterns in Spring Security CorsConfiguration:
// e.g. setAllowedOrigins(List.of("http://localhost:5173", ...))
// or setAllowedOriginPatterns(...)
let modified = false;

if (content.includes('setAllowedOriginPatterns')) {
  content = content.replace(
    /(setAllowedOriginPatterns\s*\(\s*List\.of\s*\([^)]*)(\)\s*\))/,
    (match, p1, p2) => {
      modified = true;
      return `${p1}, "${vercelProd}", "${vercelWildcard}"${p2}`;
    }
  );
} else if (content.includes('setAllowedOrigins')) {
  // If setAllowedOrigins is used with List.of(...)
  content = content.replace(
    /(setAllowedOrigins\s*\(\s*List\.of\s*\([^)]*)(\)\s*\))/,
    (match, p1, p2) => {
      modified = true;
      return `${p1}, "${vercelProd}", "${vercelWildcard}"${p2}`;
    }
  );
  // Also check Arrays.asList(...)
  if (!modified) {
    content = content.replace(
      /(setAllowedOrigins\s*\(\s*Arrays\.asList\s*\([^)]*)(\)\s*\))/,
      (match, p1, p2) => {
        modified = true;
        return `${p1}, "${vercelProd}", "${vercelWildcard}"${p2}`;
      }
    );
  }
}

// Also check addAllowedOrigin or addAllowedOriginPattern
if (!modified && content.includes('addAllowedOrigin')) {
  content = content.replace(
    /(\.addAllowedOrigin\s*\([^;]+;)/,
    `$1\n        configuration.addAllowedOrigin("${vercelProd}");\n        configuration.addAllowedOriginPattern("${vercelWildcard}");`
  );
  modified = true;
}

// If none of the specific regex matched, let's search for "localhost:5173" or "localhost" and append
if (!modified && content.includes('http://localhost:5173')) {
  content = content.replace(
    /"http:\/\/localhost:5173"/,
    `"http://localhost:5173", "${vercelProd}", "${vercelWildcard}"`
  );
  modified = true;
} else if (!modified && content.includes('http://localhost:3000')) {
  content = content.replace(
    /"http:\/\/localhost:3000"/,
    `"http://localhost:3000", "${vercelProd}", "${vercelWildcard}"`
  );
  modified = true;
}

if (modified) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated SecurityConfig.java with Vercel URL!');
} else {
  console.log('Could not find existing origin list to patch automatically. Check printed content.');
}
