import FtpDeploy from 'ftp-deploy';
import dotenv from 'dotenv';

dotenv.config();
const ftpDeploy = new FtpDeploy();

const config = {
    user: process.env.FTP_USERNAME,
    password: process.env.FTP_PASSWORD,
    host: process.env.FTP_HOST,
    port: process.env.FTP_PORT || 21,
    localRoot: './dist/',
    remoteRoot: '/public_html/blog/',
    include: ['*', '**/*'],
    exclude: [
        'dist/**/*.map',
        'node_modules/**',
        'node_modules/**/.*',
        '.git/**'
    ],
    deleteRemote: false,
    forcePasv: true,
    sftp: false
};

console.log('🚀 Starting deployment...');
console.log(`📁 Local: ${config.localRoot}`);
console.log(`🌐 Remote: ${config.host}${config.remoteRoot}`);

ftpDeploy
    .deploy(config)
    .then(res => {
        console.log('✅ Deployment completed successfully!');
        console.log(`📤 Uploaded ${res.length} files`);
    })
    .catch(err => {
        console.error('❌ Deployment failed:', err);
        process.exit(1);
    });

ftpDeploy.on('uploading', function(data) {
    console.log(`📤 Uploading: ${data.filename} (${data.transferredFileCount}/${data.totalFilesCount})`);
});

ftpDeploy.on('uploaded', function(data) {
    console.log(`✅ Uploaded: ${data.filename}`);
});

ftpDeploy.on('log', function(data) {
    console.log('ℹ️', data);
});