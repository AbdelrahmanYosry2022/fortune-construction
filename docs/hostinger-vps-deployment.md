<h1 dir="rtl">دليل رفع مشروع Fortune Construction على Hostinger VPS</h1>

<p dir="rtl">
هذا الدليل مخصص لرفع مشروع <code>fortune-construction</code> على سيرفر VPS واحد من Hostinger، مع مراعاة أن النص عربي من اليمين لليسار، بينما الأوامر والمسارات والقيم التقنية مكتوبة داخل كتل كود حتى تظل مقروءة من اليسار لليمين.
</p>

<h2 dir="rtl">النتيجة النهائية المتوقعة</h2>

<p dir="rtl">بعد تنفيذ الخطوات سيكون عندك:</p>

```text
https://DOMAIN                  Public Website
https://www.DOMAIN              Public Website
https://dashboard.DOMAIN        Dashboard
https://api.DOMAIN              API
https://api.DOMAIN/health       API Health Check
```

<h2 dir="rtl">القيم التي ستستبدلها</h2>

<p dir="rtl">قبل البدء، اعتبر أن أي قيمة من القيم التالية هي placeholder وتحتاج استبدالها بالقيمة الحقيقية عندك:</p>

```text
DOMAIN      اسم الدومين بدون https، مثال: fortuneconstruction.com
VPS_IP      عنوان IP الخاص بالسيرفر من Hostinger
REPO_URL    رابط GitHub repository إذا كنت سترفع عن طريق Git
```

<h2 dir="rtl">مكونات المشروع</h2>

<ul dir="rtl">
  <li>الموقع العام: تطبيق <code>Vite React</code>، ويتم بناؤه في مجلد <code>dist</code>.</li>
  <li>لوحة التحكم: تطبيق <code>Vite React</code> داخل <code>apps/dashboard</code>، ويتم بناؤه في <code>apps/dashboard/dist</code>.</li>
  <li>الـ API: تطبيق <code>Express</code> داخل <code>apps/api</code>، ويتم بناؤه في <code>apps/api/dist</code>.</li>
  <li>قاعدة البيانات: <code>MongoDB</code>، إما من خلال <code>MongoDB Atlas</code> أو مثبتة على نفس الـ VPS.</li>
</ul>

<h2 dir="rtl">1. تجهيز Hostinger بعد الشراء</h2>

<p dir="rtl">بعد شراء الدومين والـ VPS من Hostinger، افتح <code>hPanel</code> وخذ بيانات السيرفر:</p>

```text
VPS IP Address
Root Username
Root Password أو SSH Credentials
```

<p dir="rtl">اختيار نظام التشغيل المقترح:</p>

```text
Ubuntu 22.04 LTS
أو
Ubuntu 24.04 LTS
```

<p dir="rtl">لو Hostinger طلب منك إعداد Firewall من اللوحة، افتح البورتات التالية فقط:</p>

```text
22     SSH
80     HTTP
443    HTTPS
```

<h2 dir="rtl">2. ربط الدومين بالـ VPS</h2>

<p dir="rtl">من لوحة Hostinger افتح إعدادات الدومين:</p>

```text
Domains -> Domain portfolio -> Manage -> DNS / Nameservers
```

<p dir="rtl">
احذف أي records قديمة من نوع <code>A</code> أو <code>AAAA</code> أو <code>CNAME</code> تخص <code>@</code> أو <code>www</code> إذا كانت تشير لمكان آخر.
</p>

<p dir="rtl">ثم أضف records التالية:</p>

```text
Type    Name         Value
A       @            VPS_IP
A       www          VPS_IP
A       api          VPS_IP
A       dashboard    VPS_IP
```

<p dir="rtl">انتشار DNS قد يتم خلال دقائق، وقد يستغرق حتى 24 ساعة. يمكنك الاختبار من جهازك:</p>

```bash
nslookup DOMAIN
nslookup api.DOMAIN
nslookup dashboard.DOMAIN
```

<p dir="rtl">المفروض أن تظهر النتيجة وفيها <code>VPS_IP</code>.</p>

<h2 dir="rtl">3. الدخول على السيرفر</h2>

<p dir="rtl">من جهازك افتح Terminal واكتب:</p>

```bash
ssh root@VPS_IP
```

<p dir="rtl">أول مرة سيطلب منك تأكيد الثقة في السيرفر. اكتب:</p>

```text
yes
```

<p dir="rtl">ثم اكتب كلمة مرور <code>root</code>. طبيعي ألا تظهر الحروف أثناء كتابة كلمة المرور.</p>

<h2 dir="rtl">4. تحديث السيرفر وتثبيت الأدوات الأساسية</h2>

<p dir="rtl">نفذ الأوامر التالية على السيرفر:</p>

```bash
apt update
apt upgrade -y
apt install -y nginx git curl ufw
```

<p dir="rtl">ثبت <code>Node.js 20</code>:</p>

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

<p dir="rtl">تأكد أن الأدوات تعمل:</p>

```bash
node -v
npm -v
nginx -v
```

<p dir="rtl">ثبت <code>PM2</code> لتشغيل الـ API في الخلفية:</p>

```bash
npm install -g pm2
pm2 -v
```

<h2 dir="rtl">5. تفعيل Firewall على السيرفر</h2>

<p dir="rtl">تأكد أن SSH مفتوح قبل تفعيل الـ firewall حتى لا تفقد الاتصال بالسيرفر:</p>

```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable
ufw status
```

<h2 dir="rtl">6. إنشاء مجلد المشروع</h2>

<p dir="rtl">على السيرفر:</p>

```bash
mkdir -p /var/www/fortune-construction
cd /var/www/fortune-construction
```

<h2 dir="rtl">7. رفع الكود على السيرفر</h2>

<h3 dir="rtl">الخيار الأول: الرفع من GitHub</h3>

<p dir="rtl">إذا كان المشروع موجودًا على GitHub، استخدم:</p>

```bash
cd /var/www/fortune-construction
git clone REPO_URL current
cd current
```

<p dir="rtl">إذا كان الـ repository خاصًا، استخدم <code>Deploy Key</code> أو <code>GitHub Token</code> حسب إعدادات حسابك.</p>

<h3 dir="rtl">الخيار الثاني: الرفع من جهازك باستخدام rsync</h3>

<p dir="rtl">نفذ هذا الأمر من جهازك المحلي، من داخل مجلد المشروع:</p>

```bash
rsync -av --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude dist \
  --exclude 'apps/dashboard/dist' \
  ./ root@VPS_IP:/var/www/fortune-construction/current/
```

<p dir="rtl">بعد انتهاء الرفع، ادخل على السيرفر:</p>

```bash
ssh root@VPS_IP
cd /var/www/fortune-construction/current
```

<h2 dir="rtl">8. اختيار طريقة تشغيل MongoDB</h2>

<h3 dir="rtl">الخيار الأسهل: MongoDB Atlas</h3>

<p dir="rtl">
هذا هو الخيار الأسهل غالبًا، لأن قاعدة البيانات تكون مُدارة خارج السيرفر. ستحتاج فقط إلى connection string من Atlas.
</p>

```text
mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/fortune-construction
```

<p dir="rtl">في هذه الحالة ستكون القيم في ملف البيئة كالتالي:</p>

```text
ALLOW_REMOTE_DB=true
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/fortune-construction
```

<p dir="rtl">في MongoDB Atlas تأكد من إضافة <code>VPS_IP</code> في إعدادات <code>Network Access</code>.</p>

<h3 dir="rtl">الخيار الثاني: MongoDB على نفس الـ VPS</h3>

<p dir="rtl">إذا أردت تشغيل MongoDB على نفس السيرفر، استخدم connection string محلي:</p>

```text
MONGODB_URI=mongodb://127.0.0.1:27017/fortune-construction
ALLOW_REMOTE_DB=false
```

<p dir="rtl">
مهم جدًا: لا تفتح بورت <code>27017</code> للعالم. قاعدة البيانات يجب أن تبقى local فقط على السيرفر.
</p>

<h2 dir="rtl">9. إعداد ملف البيئة الخاص بالـ API</h2>

<p dir="rtl">على السيرفر:</p>

```bash
cd /var/www/fortune-construction/current/apps/api
cp .env.example .env
nano .env
```

<p dir="rtl">ضع القيم التالية بعد استبدال <code>DOMAIN</code> وقيمة MongoDB:</p>

```text
PORT=3001
NODE_ENV=production
PUBLIC_SITE_ORIGIN=https://DOMAIN
DASHBOARD_ORIGIN=https://dashboard.DOMAIN
ADDITIONAL_ALLOWED_ORIGINS=https://www.DOMAIN
JWT_EXPIRES_IN=24h
ALLOW_REMOTE_DB=true
JWT_SECRET=GENERATE_A_LONG_RANDOM_SECRET
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
```

<p dir="rtl">لتوليد قيمة قوية لـ <code>JWT_SECRET</code>:</p>

```bash
openssl rand -base64 48
```

<p dir="rtl">انسخ الناتج وضعه مكان <code>GENERATE_A_LONG_RANDOM_SECRET</code>.</p>

<h2 dir="rtl">10. إعداد ملفات البيئة الخاصة بالموقع والداشبورد</h2>

<p dir="rtl">
هذه خطوة مهمة جدًا في هذا المشروع. الموقع العام والداشبورد يحتاجان إلى <code>VITE_API_URL</code> قبل تنفيذ build، لأن الكود في production لا يقبل العمل بدون API URL واضح.
</p>

<p dir="rtl">على السيرفر:</p>

```bash
cd /var/www/fortune-construction/current
printf 'VITE_API_URL=https://api.DOMAIN\nVITE_PUBLIC_SITE_URL=https://DOMAIN\n' > .env.production
printf 'VITE_API_URL=https://api.DOMAIN\nVITE_PUBLIC_SITE_URL=https://DOMAIN\n' > apps/dashboard/.env.production
```

<p dir="rtl">راجع محتوى الملفات:</p>

```bash
cat .env.production
cat apps/dashboard/.env.production
```

<h2 dir="rtl">11. تثبيت dependencies وتنفيذ build</h2>

<p dir="rtl">من جذر المشروع على السيرفر:</p>

```bash
cd /var/www/fortune-construction/current
npm ci
npm run build
npm run build --workspace=apps/dashboard
npm run build --workspace=apps/api
```

<p dir="rtl">تأكد أن ملفات build موجودة:</p>

```bash
ls dist
ls apps/dashboard/dist
ls apps/api/dist
```

<h2 dir="rtl">12. تشغيل الـ API باستخدام PM2</h2>

<p dir="rtl">انسخ ملف PM2 الجاهز:</p>

```bash
cp /var/www/fortune-construction/current/deploy/ecosystem.config.cjs /var/www/fortune-construction/ecosystem.config.cjs
```

<p dir="rtl">شغل الـ API:</p>

```bash
pm2 start /var/www/fortune-construction/ecosystem.config.cjs
pm2 save
```

<p dir="rtl">اجعل PM2 يبدأ تلقائيًا بعد restart للسيرفر:</p>

```bash
pm2 startup
```

<p dir="rtl">سيطبع الأمر السابق command طويل. انسخه ونفذه كما هو، ثم اختبر الـ API من داخل السيرفر:</p>

```bash
curl http://127.0.0.1:3001/health
```

<p dir="rtl">إذا رجع JSON يحتوي على <code>status</code> فهذا يعني أن الـ API يعمل.</p>

<p dir="rtl">لو ظهرت مشكلة، راجع logs:</p>

```bash
pm2 logs fortune-api
```

<h2 dir="rtl">13. إعداد Nginx</h2>

<p dir="rtl">انسخ قالب Nginx:</p>

```bash
cp /var/www/fortune-construction/current/deploy/nginx.fortune.conf /etc/nginx/sites-available/fortune-construction
```

<p dir="rtl">استبدل <code>DOMAIN</code> بالدومين الحقيقي. مثال:</p>

```bash
sed -i 's/DOMAIN/fortuneconstruction.com/g' /etc/nginx/sites-available/fortune-construction
```

<p dir="rtl">فعّل إعدادات الموقع:</p>

```bash
ln -s /etc/nginx/sites-available/fortune-construction /etc/nginx/sites-enabled/fortune-construction
```

<p dir="rtl">إذا كان موقع Nginx الافتراضي يعمل ومسبب تعارض، عطّله:</p>

```bash
rm -f /etc/nginx/sites-enabled/default
```

<p dir="rtl">اختبر إعدادات Nginx ثم أعد تحميله:</p>

```bash
nginx -t
systemctl reload nginx
```

<p dir="rtl">اختبر الروابط بدون SSL أولًا:</p>

```text
http://DOMAIN
http://dashboard.DOMAIN
http://api.DOMAIN/health
```

<h2 dir="rtl">14. تركيب SSL باستخدام Certbot</h2>

<p dir="rtl">ثبت Certbot:</p>

```bash
apt install -y certbot python3-certbot-nginx
```

<p dir="rtl">استخرج شهادات SSL لكل الدومينات:</p>

```bash
certbot --nginx -d DOMAIN -d www.DOMAIN -d api.DOMAIN -d dashboard.DOMAIN
```

<p dir="rtl">إذا سألك عن تحويل HTTP إلى HTTPS، اختر redirect.</p>

<p dir="rtl">اختبر التجديد التلقائي للشهادة:</p>

```bash
certbot renew --dry-run
```

<h2 dir="rtl">15. الاختبار النهائي بعد الرفع</h2>

<p dir="rtl">افتح الروابط التالية في المتصفح:</p>

```text
https://DOMAIN
https://www.DOMAIN
https://dashboard.DOMAIN
https://api.DOMAIN/health
```

<p dir="rtl">اختبر من لوحة التحكم:</p>

<ul dir="rtl">
  <li>تسجيل الدخول.</li>
  <li>إضافة مشروع جديد.</li>
  <li>رفع صورة.</li>
  <li>فتح الصورة بعد الرفع.</li>
  <li>إرسال رسالة من صفحة Contact في الموقع.</li>
  <li>إرسال طلب توظيف من صفحة Careers.</li>
</ul>

<p dir="rtl">راجع logs لو احتجت:</p>

```bash
pm2 logs fortune-api
journalctl -u nginx --no-pager -n 80
```

<h2 dir="rtl">16. تحديث الموقع بعد أي تعديل لاحق</h2>

<p dir="rtl">إذا كان الرفع من GitHub:</p>

```bash
cd /var/www/fortune-construction/current
git pull
npm ci
npm run build
npm run build --workspace=apps/dashboard
npm run build --workspace=apps/api
pm2 restart fortune-api
systemctl reload nginx
```

<p dir="rtl">إذا كان الرفع باستخدام <code>rsync</code>، ارفع الملفات من جهازك أولًا، ثم نفذ أوامر build و restart نفسها على السيرفر.</p>

<h2 dir="rtl">17. أوامر مفيدة للتشخيص</h2>

<p dir="rtl">حالة PM2:</p>

```bash
pm2 status
pm2 logs fortune-api
pm2 restart fortune-api
```

<p dir="rtl">حالة Nginx:</p>

```bash
nginx -t
systemctl status nginx
journalctl -u nginx --no-pager -n 80
```

<p dir="rtl">اختبار الـ API:</p>

```bash
curl http://127.0.0.1:3001/health
curl https://api.DOMAIN/health
```

<p dir="rtl">اختبار DNS:</p>

```bash
nslookup DOMAIN
nslookup api.DOMAIN
nslookup dashboard.DOMAIN
```

<h2 dir="rtl">18. أخطاء شائعة وحلول سريعة</h2>

<h3 dir="rtl">الموقع يفتح لكن البيانات لا تظهر</h3>

<ul dir="rtl">
  <li>راجع أن <code>.env.production</code> يحتوي على <code>VITE_API_URL=https://api.DOMAIN</code>.</li>
  <li>نفذ build من جديد بعد تعديل ملفات البيئة.</li>
  <li>راجع إعدادات CORS في <code>apps/api/.env</code>.</li>
</ul>

<h3 dir="rtl">الداشبورد لا يستطيع الوصول إلى الـ API</h3>

<ul dir="rtl">
  <li>افتح <code>https://api.DOMAIN/health</code>.</li>
  <li>راجع <code>pm2 logs fortune-api</code>.</li>
  <li>تأكد أن <code>DASHBOARD_ORIGIN=https://dashboard.DOMAIN</code>.</li>
</ul>

<h3 dir="rtl">رفع الصور لا يعمل</h3>

<ul dir="rtl">
  <li>راجع وجود <code>client_max_body_size 110M</code> في إعدادات Nginx.</li>
  <li>راجع صلاحيات مجلد <code>apps/api/uploads</code>.</li>
  <li>راجع <code>pm2 logs fortune-api</code>.</li>
</ul>

<h3 dir="rtl">شهادة SSL لا تصدر</h3>

<ul dir="rtl">
  <li>تأكد أن DNS records تشير إلى <code>VPS_IP</code>.</li>
  <li>تأكد أن بورت <code>80</code> مفتوح.</li>
  <li>نفذ <code>nginx -t</code>.</li>
  <li>انتظر اكتمال DNS propagation إذا كان الدومين جديدًا.</li>
</ul>

<h2 dir="rtl">19. ملاحظات أمان مهمة</h2>

<ul dir="rtl">
  <li>لا ترفع ملف <code>.env</code> على GitHub.</li>
  <li>لا تستخدم قيمة سهلة مثل <code>JWT_SECRET=secret</code>.</li>
  <li>لا تفتح بورت <code>3001</code> للعالم، لأن الـ API يجب أن يصل إليه المستخدمون من خلال Nginx فقط.</li>
  <li>لا تفتح بورت MongoDB <code>27017</code> للعالم.</li>
  <li>افتح فقط البورتات <code>22</code> و <code>80</code> و <code>443</code> في الـ firewall.</li>
  <li>اعمل backup لقاعدة البيانات قبل أي تحديث كبير.</li>
</ul>
