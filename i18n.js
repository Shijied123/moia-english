// Language switcher.
// Any element with data-i18n="key" gets its text swapped for the chosen language.
// English comes from the HTML itself, so the pages still read fine if this file fails.
// The choice is saved in the browser and used on every page.

const LANGUAGES = [
  { code: 'en', name: 'English', english: 'English' },
  { code: 'es', name: 'Español', english: 'Spanish' },
  { code: 'zh-Hans', name: '简体中文', english: 'Chinese (Simplified)' },
  { code: 'zh-Hant', name: '繁體中文', english: 'Chinese (Traditional)' },
  { code: 'ru', name: 'Русский', english: 'Russian' },
  { code: 'bn', name: 'বাংলা', english: 'Bengali' },
  { code: 'ht', name: 'Kreyòl Ayisyen', english: 'Haitian Creole' },
  { code: 'ko', name: '한국어', english: 'Korean' },
  { code: 'ar', name: 'العربية', english: 'Arabic', rtl: true },
  { code: 'ur', name: 'اردو', english: 'Urdu', rtl: true },
  { code: 'fr', name: 'Français', english: 'French' },
  { code: 'pl', name: 'Polski', english: 'Polish' },
];

const STRINGS = {
  es: {
    choose_language: 'Elegir idioma',
    go_back: 'Volver',
    welcome: '¡Te damos la bienvenida!',
    welcome_lead: 'Practica inglés un poco cada día.',
    signup: 'Registrarse',
    signup_sub: 'Crear una cuenta',
    login: 'Iniciar sesión',
    login_sub: 'Ya tengo una cuenta',
    about: 'Quiénes somos',
    about_body: 'Ayudamos a los estudiantes de las clases de inglés de MOIA a practicar cómo hablar, leer y escribir en inglés fuera de clase. Es gratis y puedes avanzar a tu propio ritmo.',
    signup_lead: 'Crea tu cuenta. Solo toma un minuto.',
    full_name: 'Nombre completo',
    err_name: 'Escribe tu nombre completo.',
    contact: 'Correo electrónico o teléfono',
    err_contact: 'Escribe tu correo electrónico o número de teléfono.',
    password: 'Contraseña',
    pw_hint: 'Al menos 8 letras o números.',
    err_pw: 'Tu contraseña necesita al menos 8 letras o números.',
    confirm: 'Confirmar contraseña',
    confirm_hint: 'Escribe la misma contraseña otra vez.',
    err_confirm: 'Las dos contraseñas no son iguales.',
    languages: 'Idioma(s) que hablas con fluidez',
    languages_hint: 'Por ejemplo: español, chino, bengalí',
    err_languages: 'Escribe al menos un idioma.',
    age: 'Edad',
    err_age: 'Escribe tu edad.',
    create_account: 'Crear cuenta',
    have_account: '¿Ya tienes una cuenta?',
    login_link: 'Inicia sesión',
    login_lead: '¡Hola de nuevo! Sigamos practicando.',
    err_login_pw: 'Escribe tu contraseña.',
    new_here: '¿Primera vez aquí?',
    create_link: 'Crea una cuenta',
  },
  'zh-Hans': {
    choose_language: '选择语言',
    go_back: '返回',
    welcome: '欢迎！',
    welcome_lead: '每天练习一点英语。',
    signup: '注册',
    signup_sub: '创建账户',
    login: '登录',
    login_sub: '我已经有账户',
    about: '关于我们',
    about_body: '我们帮助 MOIA 英语课的学生在课外练习英语口语、阅读和写作。完全免费，你可以按自己的节奏学习。',
    signup_lead: '创建你的账户，只需要一分钟。',
    full_name: '全名',
    err_name: '请填写你的全名。',
    contact: '电子邮箱或电话',
    err_contact: '请填写你的电子邮箱或电话号码。',
    password: '密码',
    pw_hint: '至少 8 个字母或数字。',
    err_pw: '密码至少需要 8 个字母或数字。',
    confirm: '确认密码',
    confirm_hint: '再输入一次相同的密码。',
    err_confirm: '两次输入的密码不一样。',
    languages: '你能流利使用的语言',
    languages_hint: '例如：西班牙语、中文、孟加拉语',
    err_languages: '请至少填写一种语言。',
    age: '年龄',
    err_age: '请填写你的年龄。',
    create_account: '创建账户',
    have_account: '已经有账户了？',
    login_link: '登录',
    login_lead: '欢迎回来！我们继续练习吧。',
    err_login_pw: '请填写你的密码。',
    new_here: '第一次来？',
    create_link: '创建账户',
  },
  'zh-Hant': {
    choose_language: '選擇語言',
    go_back: '返回',
    welcome: '歡迎！',
    welcome_lead: '每天練習一點英文。',
    signup: '註冊',
    signup_sub: '建立帳戶',
    login: '登入',
    login_sub: '我已經有帳戶',
    about: '關於我們',
    about_body: '我們幫助 MOIA 英文課的學生在課外練習英文口說、閱讀和寫作。完全免費，你可以按照自己的步調學習。',
    signup_lead: '建立你的帳戶，只需要一分鐘。',
    full_name: '全名',
    err_name: '請填寫你的全名。',
    contact: '電子郵件或電話',
    err_contact: '請填寫你的電子郵件或電話號碼。',
    password: '密碼',
    pw_hint: '至少 8 個字母或數字。',
    err_pw: '密碼至少需要 8 個字母或數字。',
    confirm: '確認密碼',
    confirm_hint: '再輸入一次相同的密碼。',
    err_confirm: '兩次輸入的密碼不一樣。',
    languages: '你能流利使用的語言',
    languages_hint: '例如：西班牙文、中文、孟加拉文',
    err_languages: '請至少填寫一種語言。',
    age: '年齡',
    err_age: '請填寫你的年齡。',
    create_account: '建立帳戶',
    have_account: '已經有帳戶了？',
    login_link: '登入',
    login_lead: '歡迎回來！我們繼續練習吧。',
    err_login_pw: '請填寫你的密碼。',
    new_here: '第一次來？',
    create_link: '建立帳戶',
  },
  ru: {
    choose_language: 'Выбрать язык',
    go_back: 'Назад',
    welcome: 'Добро пожаловать!',
    welcome_lead: 'Занимайтесь английским понемногу каждый день.',
    signup: 'Регистрация',
    signup_sub: 'Создать аккаунт',
    login: 'Войти',
    login_sub: 'У меня уже есть аккаунт',
    about: 'О нас',
    about_body: 'Мы помогаем студентам курсов английского языка MOIA практиковаться в разговоре, чтении и письме на английском вне занятий. Это бесплатно, и вы можете заниматься в своём темпе.',
    signup_lead: 'Создайте аккаунт. Это займёт всего минуту.',
    full_name: 'Полное имя',
    err_name: 'Пожалуйста, напишите ваше полное имя.',
    contact: 'Эл. почта или телефон',
    err_contact: 'Пожалуйста, напишите вашу эл. почту или номер телефона.',
    password: 'Пароль',
    pw_hint: 'Не менее 8 букв или цифр.',
    err_pw: 'Пароль должен содержать не менее 8 букв или цифр.',
    confirm: 'Повторите пароль',
    confirm_hint: 'Напишите тот же пароль ещё раз.',
    err_confirm: 'Пароли не совпадают.',
    languages: 'Языки, которыми вы свободно владеете',
    languages_hint: 'Например: испанский, китайский, бенгальский',
    err_languages: 'Пожалуйста, напишите хотя бы один язык.',
    age: 'Возраст',
    err_age: 'Пожалуйста, напишите ваш возраст.',
    create_account: 'Создать аккаунт',
    have_account: 'Уже есть аккаунт?',
    login_link: 'Войти',
    login_lead: 'С возвращением! Продолжим заниматься.',
    err_login_pw: 'Пожалуйста, напишите ваш пароль.',
    new_here: 'Впервые здесь?',
    create_link: 'Создать аккаунт',
  },
  bn: {
    choose_language: 'ভাষা বেছে নিন',
    go_back: 'ফিরে যান',
    welcome: 'স্বাগতম!',
    welcome_lead: 'প্রতিদিন একটু একটু করে ইংরেজি অনুশীলন করুন।',
    signup: 'সাইন আপ',
    signup_sub: 'একটি অ্যাকাউন্ট তৈরি করুন',
    login: 'লগ ইন',
    login_sub: 'আমার আগে থেকেই অ্যাকাউন্ট আছে',
    about: 'আমাদের সম্পর্কে',
    about_body: 'আমরা MOIA ইংরেজি ক্লাসের শিক্ষার্থীদের ক্লাসের বাইরে ইংরেজিতে কথা বলা, পড়া এবং লেখা অনুশীলন করতে সাহায্য করি। এটি বিনামূল্যে, এবং আপনি নিজের গতিতে শিখতে পারেন।',
    signup_lead: 'আপনার অ্যাকাউন্ট তৈরি করুন। মাত্র এক মিনিট লাগবে।',
    full_name: 'পুরো নাম',
    err_name: 'দয়া করে আপনার পুরো নাম লিখুন।',
    contact: 'ইমেইল বা ফোন',
    err_contact: 'দয়া করে আপনার ইমেইল বা ফোন নম্বর লিখুন।',
    password: 'পাসওয়ার্ড',
    pw_hint: 'কমপক্ষে ৮টি অক্ষর বা সংখ্যা।',
    err_pw: 'আপনার পাসওয়ার্ডে কমপক্ষে ৮টি অক্ষর বা সংখ্যা থাকতে হবে।',
    confirm: 'পাসওয়ার্ড নিশ্চিত করুন',
    confirm_hint: 'একই পাসওয়ার্ড আবার লিখুন।',
    err_confirm: 'দুটি পাসওয়ার্ড এক নয়।',
    languages: 'যে ভাষা(গুলো)তে আপনি সাবলীল',
    languages_hint: 'যেমন: স্প্যানিশ, চাইনিজ, বাংলা',
    err_languages: 'দয়া করে অন্তত একটি ভাষা লিখুন।',
    age: 'বয়স',
    err_age: 'দয়া করে আপনার বয়স লিখুন।',
    create_account: 'অ্যাকাউন্ট তৈরি করুন',
    have_account: 'আগে থেকেই অ্যাকাউন্ট আছে?',
    login_link: 'লগ ইন করুন',
    login_lead: 'আবার স্বাগতম! চলুন অনুশীলন চালিয়ে যাই।',
    err_login_pw: 'দয়া করে আপনার পাসওয়ার্ড লিখুন।',
    new_here: 'এখানে নতুন?',
    create_link: 'একটি অ্যাকাউন্ট তৈরি করুন',
  },
  ht: {
    choose_language: 'Chwazi lang',
    go_back: 'Retounen',
    welcome: 'Byenvini!',
    welcome_lead: 'Pratike angle yon ti kras chak jou.',
    signup: 'Enskri',
    signup_sub: 'Kreye yon kont',
    login: 'Konekte',
    login_sub: 'Mwen gen yon kont deja',
    about: 'Konsènan nou',
    about_body: 'Nou ede elèv ki nan klas angle MOIA yo pratike pale, li ak ekri angle andeyò klas la. Li gratis, epi ou ka avanse nan pwòp rit ou.',
    signup_lead: 'Kreye kont ou. Sa pran sèlman yon minit.',
    full_name: 'Non konplè',
    err_name: 'Tanpri ekri non konplè ou.',
    contact: 'Imèl oswa telefòn',
    err_contact: 'Tanpri ekri imèl ou oswa nimewo telefòn ou.',
    password: 'Modpas',
    pw_hint: 'Omwen 8 lèt oswa chif.',
    err_pw: 'Modpas ou bezwen omwen 8 lèt oswa chif.',
    confirm: 'Konfime modpas',
    confirm_hint: 'Ekri menm modpas la ankò.',
    err_confirm: 'De modpas yo pa menm.',
    languages: 'Lang ou pale byen',
    languages_hint: 'Pa egzanp: panyòl, chinwa, bengali',
    err_languages: 'Tanpri ekri omwen yon lang.',
    age: 'Laj',
    err_age: 'Tanpri ekri laj ou.',
    create_account: 'Kreye kont',
    have_account: 'Ou gen yon kont deja?',
    login_link: 'Konekte',
    login_lead: 'Byenvini ankò! Ann kontinye pratike.',
    err_login_pw: 'Tanpri ekri modpas ou.',
    new_here: 'Ou nouvo isit la?',
    create_link: 'Kreye yon kont',
  },
  ko: {
    choose_language: '언어 선택',
    go_back: '뒤로 가기',
    welcome: '환영합니다!',
    welcome_lead: '매일 조금씩 영어를 연습하세요.',
    signup: '회원가입',
    signup_sub: '계정 만들기',
    login: '로그인',
    login_sub: '이미 계정이 있어요',
    about: '소개',
    about_body: '저희는 MOIA 영어 수업을 듣는 학생들이 수업 밖에서도 영어 말하기, 읽기, 쓰기를 연습할 수 있도록 돕습니다. 무료이며, 자신의 속도에 맞춰 배울 수 있습니다.',
    signup_lead: '계정을 만드세요. 1분이면 됩니다.',
    full_name: '이름(성명)',
    err_name: '이름을 모두 입력해 주세요.',
    contact: '이메일 또는 전화번호',
    err_contact: '이메일 또는 전화번호를 입력해 주세요.',
    password: '비밀번호',
    pw_hint: '문자나 숫자 8개 이상.',
    err_pw: '비밀번호는 문자나 숫자 8개 이상이어야 합니다.',
    confirm: '비밀번호 확인',
    confirm_hint: '같은 비밀번호를 한 번 더 입력하세요.',
    err_confirm: '두 비밀번호가 같지 않습니다.',
    languages: '유창하게 하는 언어',
    languages_hint: '예: 스페인어, 중국어, 벵골어',
    err_languages: '언어를 하나 이상 입력해 주세요.',
    age: '나이',
    err_age: '나이를 입력해 주세요.',
    create_account: '계정 만들기',
    have_account: '이미 계정이 있나요?',
    login_link: '로그인',
    login_lead: '다시 오신 것을 환영합니다! 계속 연습해요.',
    err_login_pw: '비밀번호를 입력해 주세요.',
    new_here: '처음 오셨나요?',
    create_link: '계정 만들기',
  },
  ar: {
    choose_language: 'اختر اللغة',
    go_back: 'رجوع',
    welcome: 'أهلاً بك!',
    welcome_lead: 'تدرّب على الإنجليزية قليلاً كل يوم.',
    signup: 'التسجيل',
    signup_sub: 'إنشاء حساب جديد',
    login: 'تسجيل الدخول',
    login_sub: 'لديّ حساب بالفعل',
    about: 'من نحن',
    about_body: 'نساعد طلاب دروس اللغة الإنجليزية في MOIA على التدرّب على التحدث والقراءة والكتابة بالإنجليزية خارج الصف. الموقع مجاني، ويمكنك التعلّم بالسرعة التي تناسبك.',
    signup_lead: 'أنشئ حسابك. لن يستغرق الأمر سوى دقيقة.',
    full_name: 'الاسم الكامل',
    err_name: 'يُرجى كتابة اسمك الكامل.',
    contact: 'البريد الإلكتروني أو الهاتف',
    err_contact: 'يُرجى كتابة بريدك الإلكتروني أو رقم هاتفك.',
    password: 'كلمة المرور',
    pw_hint: '8 أحرف أو أرقام على الأقل.',
    err_pw: 'يجب أن تحتوي كلمة المرور على 8 أحرف أو أرقام على الأقل.',
    confirm: 'تأكيد كلمة المرور',
    confirm_hint: 'اكتب كلمة المرور نفسها مرة أخرى.',
    err_confirm: 'كلمتا المرور غير متطابقتين.',
    languages: 'اللغة (اللغات) التي تتحدثها بطلاقة',
    languages_hint: 'مثال: الإسبانية، الصينية، البنغالية',
    err_languages: 'يُرجى كتابة لغة واحدة على الأقل.',
    age: 'العمر',
    err_age: 'يُرجى كتابة عمرك.',
    create_account: 'إنشاء الحساب',
    have_account: 'لديك حساب بالفعل؟',
    login_link: 'سجّل الدخول',
    login_lead: 'مرحباً بعودتك! لنواصل التدرّب.',
    err_login_pw: 'يُرجى كتابة كلمة المرور.',
    new_here: 'جديد هنا؟',
    create_link: 'أنشئ حساباً',
  },
  ur: {
    choose_language: 'زبان منتخب کریں',
    go_back: 'واپس جائیں',
    welcome: 'خوش آمدید!',
    welcome_lead: 'ہر روز تھوڑی سی انگریزی کی مشق کریں۔',
    signup: 'سائن اپ',
    signup_sub: 'اکاؤنٹ بنائیں',
    login: 'لاگ ان',
    login_sub: 'میرا اکاؤنٹ پہلے سے ہے',
    about: 'ہمارے بارے میں',
    about_body: 'ہم MOIA کی انگریزی کلاسوں کے طلبہ کو کلاس کے باہر انگریزی بولنے، پڑھنے اور لکھنے کی مشق میں مدد دیتے ہیں۔ یہ مفت ہے، اور آپ اپنی رفتار سے سیکھ سکتے ہیں۔',
    signup_lead: 'اپنا اکاؤنٹ بنائیں۔ اس میں صرف ایک منٹ لگتا ہے۔',
    full_name: 'پورا نام',
    err_name: 'براہ کرم اپنا پورا نام لکھیں۔',
    contact: 'ای میل یا فون',
    err_contact: 'براہ کرم اپنا ای میل یا فون نمبر لکھیں۔',
    password: 'پاس ورڈ',
    pw_hint: 'کم از کم 8 حروف یا نمبر۔',
    err_pw: 'آپ کے پاس ورڈ میں کم از کم 8 حروف یا نمبر ہونے چاہئیں۔',
    confirm: 'پاس ورڈ کی تصدیق کریں',
    confirm_hint: 'وہی پاس ورڈ دوبارہ لکھیں۔',
    err_confirm: 'دونوں پاس ورڈ ایک جیسے نہیں ہیں۔',
    languages: 'وہ زبان (زبانیں) جو آپ روانی سے بولتے ہیں',
    languages_hint: 'مثلاً: ہسپانوی، چینی، بنگالی',
    err_languages: 'براہ کرم کم از کم ایک زبان لکھیں۔',
    age: 'عمر',
    err_age: 'براہ کرم اپنی عمر لکھیں۔',
    create_account: 'اکاؤنٹ بنائیں',
    have_account: 'کیا آپ کا اکاؤنٹ پہلے سے ہے؟',
    login_link: 'لاگ ان کریں',
    login_lead: 'دوبارہ خوش آمدید! آئیے مشق جاری رکھیں۔',
    err_login_pw: 'براہ کرم اپنا پاس ورڈ لکھیں۔',
    new_here: 'یہاں نئے ہیں؟',
    create_link: 'اکاؤنٹ بنائیں',
  },
  fr: {
    choose_language: 'Choisir la langue',
    go_back: 'Retour',
    welcome: 'Bienvenue !',
    welcome_lead: "Pratiquez l'anglais un peu chaque jour.",
    signup: "S'inscrire",
    signup_sub: 'Créer un compte',
    login: 'Se connecter',
    login_sub: "J'ai déjà un compte",
    about: 'Qui sommes-nous',
    about_body: "Nous aidons les élèves des cours d'anglais de MOIA à pratiquer l'oral, la lecture et l'écriture en anglais en dehors des cours. C'est gratuit, et vous pouvez avancer à votre rythme.",
    signup_lead: "Créez votre compte. Cela ne prend qu'une minute.",
    full_name: 'Nom complet',
    err_name: 'Veuillez écrire votre nom complet.',
    contact: 'E-mail ou téléphone',
    err_contact: 'Veuillez écrire votre e-mail ou votre numéro de téléphone.',
    password: 'Mot de passe',
    pw_hint: 'Au moins 8 lettres ou chiffres.',
    err_pw: 'Votre mot de passe doit contenir au moins 8 lettres ou chiffres.',
    confirm: 'Confirmer le mot de passe',
    confirm_hint: 'Écrivez le même mot de passe encore une fois.',
    err_confirm: 'Les deux mots de passe ne sont pas identiques.',
    languages: 'Langue(s) que vous parlez couramment',
    languages_hint: 'Par exemple : espagnol, chinois, bengali',
    err_languages: 'Veuillez écrire au moins une langue.',
    age: 'Âge',
    err_age: 'Veuillez écrire votre âge.',
    create_account: 'Créer le compte',
    have_account: 'Vous avez déjà un compte ?',
    login_link: 'Connectez-vous',
    login_lead: 'Bon retour ! Continuons à pratiquer.',
    err_login_pw: 'Veuillez écrire votre mot de passe.',
    new_here: 'Première visite ?',
    create_link: 'Créez un compte',
  },
  pl: {
    choose_language: 'Wybierz język',
    go_back: 'Wróć',
    welcome: 'Witamy!',
    welcome_lead: 'Ćwicz angielski codziennie po trochu.',
    signup: 'Zarejestruj się',
    signup_sub: 'Utwórz konto',
    login: 'Zaloguj się',
    login_sub: 'Mam już konto',
    about: 'O nas',
    about_body: 'Pomagamy uczniom zajęć z angielskiego MOIA ćwiczyć mówienie, czytanie i pisanie po angielsku poza zajęciami. To nic nie kosztuje, a uczysz się we własnym tempie.',
    signup_lead: 'Utwórz konto. To zajmie tylko minutę.',
    full_name: 'Imię i nazwisko',
    err_name: 'Wpisz swoje imię i nazwisko.',
    contact: 'E-mail lub telefon',
    err_contact: 'Wpisz swój e-mail lub numer telefonu.',
    password: 'Hasło',
    pw_hint: 'Co najmniej 8 liter lub cyfr.',
    err_pw: 'Hasło musi mieć co najmniej 8 liter lub cyfr.',
    confirm: 'Potwierdź hasło',
    confirm_hint: 'Wpisz to samo hasło jeszcze raz.',
    err_confirm: 'Hasła nie są takie same.',
    languages: 'Język(i), którymi mówisz płynnie',
    languages_hint: 'Na przykład: hiszpański, chiński, bengalski',
    err_languages: 'Wpisz co najmniej jeden język.',
    age: 'Wiek',
    err_age: 'Wpisz swój wiek.',
    create_account: 'Utwórz konto',
    have_account: 'Masz już konto?',
    login_link: 'Zaloguj się',
    login_lead: 'Witaj ponownie! Ćwiczmy dalej.',
    err_login_pw: 'Wpisz swoje hasło.',
    new_here: 'Pierwszy raz tutaj?',
    create_link: 'Utwórz konto',
  },
};

// Practice page text. Each language's list follows PRACTICE_KEYS in order.
const ENGLISH_ONLY_IN_JS = {
  translate_error: "Translation isn't working right now. Try again later.",
};

const PRACTICE_KEYS = [
  'practice', 'choose_topic', 'general_practice', 'class_code', 'add_code', 'code_not_found',
  'class_location', 'class_teacher', 'change', 'total_hours', 'settings', 'translate',
  'type_here', 'translate_error',
  'topic_interview', 'topic_finances', 'topic_help', 'topic_restaurant', 'topic_doctor',
  'topic_vote', 'topic_911', 'topic_school', 'topic_weather',
  'topic_parent_teacher', 'topic_mta', 'topic_party', 'topic_friends', 'topic_appointment',
  'log_out',
];

const PRACTICE_STRINGS = {
  es: [
    'Practicar', 'Elige un tema para conversar:', 'Práctica general', 'Código de clase de MOIA', 'Agregar', 'No encontramos ese código. Pregúntale a tu maestro.',
    'Lugar', 'Maestro/a', 'Cambiar', 'Horas en total', 'Configuración', 'Traducir',
    'Escribe aquí', 'La traducción no funciona ahora. Inténtalo más tarde.',
    'Entrevista', 'Hablar de finanzas', 'Pedir ayuda', 'Restaurante (pedir y pagar)', 'Visitar al médico',
    'Registrarse para votar', 'Llamar al 911', 'Hablar de la escuela', 'El clima y las tormentas',
    'Reunión de padres y maestros', 'Moverse en el MTA y pedir direcciones', 'Planear una fiesta', 'Hacer planes con un amigo', 'Hacer una cita',
    'Cerrar sesión',
  ],
  'zh-Hans': [
    '练习', '选择一个对话主题：', '自由练习', 'MOIA 班级代码', '添加', '找不到这个代码，请问你的老师。',
    '地点', '老师', '更改', '总时数', '设置', '翻译',
    '在这里输入', '翻译暂时无法使用，请稍后再试。',
    '面试', '谈论财务', '请求帮助', '餐厅（点餐和付款）', '看医生',
    '选民登记', '拨打 911', '谈论学校', '天气和暴风雨',
    '家长会', '乘坐 MTA 和问路', '筹划派对', '和朋友约时间', '预约',
    '退出登录',
  ],
  'zh-Hant': [
    '練習', '選擇一個對話主題：', '自由練習', 'MOIA 班級代碼', '新增', '找不到這個代碼，請問你的老師。',
    '地點', '老師', '更改', '總時數', '設定', '翻譯',
    '在這裡輸入', '翻譯暫時無法使用，請稍後再試。',
    '面試', '談論財務', '請求幫助', '餐廳（點餐和付款）', '看醫生',
    '選民登記', '撥打 911', '談論學校', '天氣和暴風雨',
    '家長會', '搭乘 MTA 和問路', '籌劃派對', '和朋友約時間', '預約',
    '登出',
  ],
  ru: [
    'Практика', 'Выберите тему для разговора:', 'Свободная практика', 'Код класса MOIA', 'Добавить', 'Мы не нашли этот код. Спросите у преподавателя.',
    'Место', 'Преподаватель', 'Изменить', 'Всего часов', 'Настройки', 'Перевести',
    'Пишите здесь', 'Перевод сейчас не работает. Попробуйте позже.',
    'Собеседование', 'Разговор о финансах', 'Просьба о помощи', 'Ресторан (заказ и оплата)', 'Визит к врачу',
    'Регистрация для голосования', 'Звонок в 911', 'Разговор о школе', 'Погода и шторм',
    'Встреча родителей с учителем', 'Транспорт MTA и как пройти', 'Планируем вечеринку', 'Договориться с другом о встрече', 'Запись на приём',
    'Выйти',
  ],
  bn: [
    'অনুশীলন', 'কথা বলার জন্য একটি বিষয় বেছে নিন:', 'সাধারণ অনুশীলন', 'MOIA ক্লাস কোড', 'যোগ করুন', 'এই কোডটি খুঁজে পাওয়া যায়নি। আপনার শিক্ষককে জিজ্ঞেস করুন।',
    'স্থান', 'শিক্ষক', 'পরিবর্তন করুন', 'মোট ঘণ্টা', 'সেটিংস', 'অনুবাদ করুন',
    'এখানে লিখুন', 'এখন অনুবাদ কাজ করছে না। পরে আবার চেষ্টা করুন।',
    'ইন্টারভিউ', 'টাকাপয়সা নিয়ে কথা বলা', 'সাহায্য চাওয়া', 'রেস্তোরাঁ (অর্ডার ও পেমেন্ট)', 'ডাক্তার দেখানো',
    'ভোটার নিবন্ধন', '৯১১-এ ফোন করা', 'স্কুল নিয়ে কথা বলা', 'আবহাওয়া ও ঝড়',
    'অভিভাবক-শিক্ষক সভা', 'MTA-তে চলাচল ও পথনির্দেশ', 'পার্টির পরিকল্পনা', 'বন্ধুর সাথে পরিকল্পনা করা', 'অ্যাপয়েন্টমেন্ট নেওয়া',
    'লগ আউট',
  ],
  ht: [
    'Pratike', 'Chwazi yon sijè pou pale:', 'Pratik jeneral', 'Kòd klas MOIA', 'Ajoute', 'Nou pa jwenn kòd sa a. Tanpri mande pwofesè w.',
    'Kote', 'Pwofesè', 'Chanje', 'Total èdtan', 'Paramèt', 'Tradui',
    'Ekri la a', 'Tradiksyon an pa mache kounye a. Eseye ankò pita.',
    'Entèvyou', 'Pale sou lajan', 'Mande èd', 'Restoran (kòmande ak peye)', 'Ale kay doktè',
    'Enskri pou vote', 'Rele 911', 'Pale sou lekòl', 'Tan ak tanpèt',
    'Reyinyon paran ak pwofesè', 'Deplase ak MTA ak mande direksyon', 'Planifye yon fèt', 'Fè plan ak yon zanmi', 'Pran yon randevou',
    'Dekonekte',
  ],
  ko: [
    '연습', '대화할 주제를 고르세요:', '자유 연습', 'MOIA 수업 코드', '추가', '코드를 찾을 수 없습니다. 선생님께 물어보세요.',
    '장소', '선생님', '변경', '총 시간', '설정', '번역',
    '여기에 입력하세요', '지금은 번역할 수 없습니다. 나중에 다시 시도하세요.',
    '면접', '돈 관리에 대해 이야기하기', '도움 요청하기', '식당 (주문과 계산)', '병원 방문',
    '유권자 등록', '911에 전화하기', '학교에 대해 이야기하기', '날씨와 폭풍',
    '학부모-교사 상담', 'MTA 이용과 길 찾기', '파티 계획하기', '친구와 약속 잡기', '예약하기',
    '로그아웃',
  ],
  ar: [
    'تدرّب', 'اختر موضوعاً للحديث عنه:', 'تدريب عام', 'رمز صف MOIA', 'إضافة', 'لم نجد هذا الرمز. يُرجى سؤال معلّمك.',
    'المكان', 'المعلّم', 'تغيير', 'إجمالي الساعات', 'الإعدادات', 'ترجمة',
    'اكتب هنا', 'الترجمة لا تعمل الآن. حاول مرة أخرى لاحقاً.',
    'مقابلة', 'التحدث عن الأمور المالية', 'طلب المساعدة', 'المطعم (الطلب والدفع)', 'زيارة الطبيب',
    'التسجيل للتصويت', 'الاتصال بـ 911', 'التحدث عن المدرسة', 'الطقس والعواصف',
    'اجتماع أولياء الأمور والمعلمين', 'التنقل في MTA والسؤال عن الاتجاهات', 'التخطيط لحفلة', 'وضع خطط مع صديق', 'حجز موعد',
    'تسجيل الخروج',
  ],
  ur: [
    'مشق', 'بات کرنے کے لیے ایک موضوع منتخب کریں:', 'عام مشق', 'MOIA کلاس کوڈ', 'شامل کریں', 'ہمیں یہ کوڈ نہیں ملا۔ براہ کرم اپنے استاد سے پوچھیں۔',
    'جگہ', 'استاد', 'تبدیل کریں', 'کل گھنٹے', 'ترتیبات', 'ترجمہ کریں',
    'یہاں لکھیں', 'ترجمہ ابھی کام نہیں کر رہا۔ بعد میں دوبارہ کوشش کریں۔',
    'انٹرویو', 'مالی معاملات کے بارے میں بات کرنا', 'مدد مانگنا', 'ریستوران (آرڈر اور ادائیگی)', 'ڈاکٹر کے پاس جانا',
    'ووٹ کے لیے رجسٹر کرنا', '911 پر کال کرنا', 'اسکول کے بارے میں بات کرنا', 'موسم اور طوفان',
    'والدین اور استاد کی ملاقات', 'MTA میں سفر اور راستہ پوچھنا', 'پارٹی کی منصوبہ بندی', 'دوست کے ساتھ منصوبہ بنانا', 'اپوائنٹمنٹ بک کرنا',
    'لاگ آؤٹ',
  ],
  fr: [
    'Pratiquer', 'Choisissez un sujet de conversation :', 'Pratique libre', 'Code de classe MOIA', 'Ajouter', 'Nous ne trouvons pas ce code. Demandez à votre professeur.',
    'Lieu', 'Professeur', 'Modifier', 'Heures au total', 'Paramètres', 'Traduire',
    'Écrivez ici', 'La traduction ne fonctionne pas pour le moment. Réessayez plus tard.',
    'Entretien', "Parler d'argent", "Demander de l'aide", 'Restaurant (commander et payer)', 'Aller chez le médecin',
    "S'inscrire pour voter", 'Appeler le 911', "Parler de l'école", 'La météo et les tempêtes',
    'Réunion parents-professeurs', 'Se déplacer avec la MTA et demander son chemin', 'Organiser une fête', 'Faire des projets avec un ami', 'Prendre rendez-vous',
    'Se déconnecter',
  ],
  pl: [
    'Ćwicz', 'Wybierz temat rozmowy:', 'Ćwiczenie ogólne', 'Kod klasy MOIA', 'Dodaj', 'Nie znaleźliśmy tego kodu. Zapytaj nauczyciela.',
    'Miejsce', 'Nauczyciel', 'Zmień', 'Łącznie godzin', 'Ustawienia', 'Przetłumacz',
    'Pisz tutaj', 'Tłumaczenie teraz nie działa. Spróbuj później.',
    'Rozmowa kwalifikacyjna', 'Rozmowa o finansach', 'Prośba o pomoc', 'Restauracja (zamawianie i płacenie)', 'Wizyta u lekarza',
    'Rejestracja do głosowania', 'Dzwonienie pod 911', 'Rozmowa o szkole', 'Pogoda i burze',
    'Spotkanie rodziców z nauczycielem', 'Poruszanie się MTA i pytanie o drogę', 'Planowanie imprezy', 'Umawianie się z przyjacielem', 'Umawianie wizyty',
    'Wyloguj się',
  ],
};

Object.entries(PRACTICE_STRINGS).forEach(([code, values]) => {
  PRACTICE_KEYS.forEach((key, i) => { STRINGS[code][key] = values[i]; });
});

// Conversation page text. Each language's list follows CONVO_KEYS in order.
// 'en' is here too because conversation.js writes most of these with window.t().
// The transcript itself (what the student and teacher say) always stays in English.
const CONVO_KEYS = [
  'ai_teacher', 'transcript', 'you_label', 'teacher_label',
  'tap_to_talk', 'listening', 'teacher_talking', 'thinking', 'stop_listening',
  'type_answer', 'send', 'hide', 'show', 'hide_transcript', 'show_transcript',
  'translate_to', 'hear_again', 'tap_to_hear',
  'no_speech_support', 'mic_blocked', 'no_mic', 'didnt_hear',
  'great_practice', 'start_over', 'demo_mode', 'try_again', 'network_error', 'translating',
];

const CONVO_STRINGS = {
  en: [
    'AI teacher', 'Transcript', 'You:', 'Teacher:',
    'Tap to talk', 'Listening…', 'Teacher is talking…', 'Thinking…', 'Stop listening',
    'Or type your answer here', 'Send', 'Hide', 'Show', 'Hide transcript', 'Show transcript',
    'Translate to', 'Hear again', 'Tap to hear the teacher',
    "Your browser can't hear you. Type instead.", 'The microphone is blocked. Allow it in your browser settings, or type instead.', "We can't find a microphone. Type instead.", "I didn't hear you. Tap to try again.",
    'Great practice today!', 'Start over', 'Demo mode — not connected to AI yet', 'Try again', "We can't reach the teacher. Check your internet and try again.", 'Translating…',
  ],
  es: [
    'Maestra de IA', 'Transcripción', 'Tú:', 'Maestra:',
    'Toca para hablar', 'Escuchando…', 'La maestra está hablando…', 'Pensando…', 'Dejar de escuchar',
    'O escribe tu respuesta aquí', 'Enviar', 'Ocultar', 'Mostrar', 'Ocultar la transcripción', 'Mostrar la transcripción',
    'Traducir a', 'Escuchar otra vez', 'Toca para escuchar a la maestra',
    'Tu navegador no puede escucharte. Escribe tu respuesta.', 'El micrófono está bloqueado. Permítelo en la configuración del navegador o escribe tu respuesta.', 'No encontramos un micrófono. Escribe tu respuesta.', 'No te escuché. Toca para intentarlo otra vez.',
    '¡Practicaste muy bien hoy!', 'Empezar de nuevo', 'Modo de prueba: todavía no está conectado a la IA', 'Intentar otra vez', 'No podemos conectar con la maestra. Revisa tu internet e inténtalo otra vez.', 'Traduciendo…',
  ],
  'zh-Hans': [
    'AI 老师', '对话记录', '你：', '老师：',
    '点一下开始说话', '正在听…', '老师正在说话…', '正在思考…', '停止收听',
    '或者在这里输入你的回答', '发送', '隐藏', '显示', '隐藏对话记录', '显示对话记录',
    '翻译成', '再听一遍', '点一下听老师说话',
    '你的浏览器听不到你的声音。请改用打字。', '麦克风被阻止了。请在浏览器设置中允许使用麦克风，或者改用打字。', '找不到麦克风。请改用打字。', '我没听到你说话。点一下再试一次。',
    '今天练习得很好！', '重新开始', '演示模式——还没有连接 AI', '再试一次', '联系不上老师。请检查网络，然后再试一次。', '正在翻译…',
  ],
  'zh-Hant': [
    'AI 老師', '對話記錄', '你：', '老師：',
    '點一下開始說話', '正在聽…', '老師正在說話…', '正在思考…', '停止收聽',
    '或者在這裡輸入你的回答', '傳送', '隱藏', '顯示', '隱藏對話記錄', '顯示對話記錄',
    '翻譯成', '再聽一遍', '點一下聽老師說話',
    '你的瀏覽器聽不到你的聲音。請改用打字。', '麥克風被封鎖了。請在瀏覽器設定中允許使用麥克風，或者改用打字。', '找不到麥克風。請改用打字。', '我沒聽到你說話。點一下再試一次。',
    '今天練習得很好！', '重新開始', '示範模式——還沒有連接 AI', '再試一次', '聯絡不上老師。請檢查網路，然後再試一次。', '正在翻譯…',
  ],
  ru: [
    'ИИ-учитель', 'Текст разговора', 'Вы:', 'Учитель:',
    'Нажмите, чтобы говорить', 'Слушаю…', 'Учитель говорит…', 'Думаю…', 'Перестать слушать',
    'Или напишите ответ здесь', 'Отправить', 'Скрыть', 'Показать', 'Скрыть текст разговора', 'Показать текст разговора',
    'Перевести на', 'Послушать ещё раз', 'Нажмите, чтобы услышать учителя',
    'Ваш браузер вас не слышит. Напишите ответ.', 'Микрофон заблокирован. Разрешите его в настройках браузера или напишите ответ.', 'Мы не нашли микрофон. Напишите ответ.', 'Ничего не слышно. Нажмите и попробуйте ещё раз.',
    'Сегодня вы хорошо позанимались!', 'Начать заново', 'Демо-режим — ИИ пока не подключён', 'Попробовать ещё раз', 'Не удаётся связаться с учителем. Проверьте интернет и попробуйте ещё раз.', 'Идёт перевод…',
  ],
  bn: [
    'এআই শিক্ষক', 'কথোপকথনের লেখা', 'আপনি:', 'শিক্ষক:',
    'কথা বলতে চাপুন', 'শুনছি…', 'শিক্ষক কথা বলছেন…', 'ভাবছি…', 'শোনা বন্ধ করুন',
    'অথবা এখানে আপনার উত্তর লিখুন', 'পাঠান', 'লুকান', 'দেখান', 'কথোপকথনের লেখা লুকান', 'কথোপকথনের লেখা দেখান',
    'অনুবাদের ভাষা', 'আবার শুনুন', 'শিক্ষকের কথা শুনতে চাপুন',
    'আপনার ব্রাউজার আপনার কথা শুনতে পারছে না। লিখে উত্তর দিন।', 'মাইক্রোফোন বন্ধ করা আছে। ব্রাউজারের সেটিংসে অনুমতি দিন, অথবা লিখে উত্তর দিন।', 'কোনো মাইক্রোফোন পাওয়া যায়নি। লিখে উত্তর দিন।', 'আপনার কথা শোনা যায়নি। আবার চেষ্টা করতে চাপুন।',
    'আজ খুব ভালো অনুশীলন হয়েছে!', 'আবার শুরু করুন', 'ডেমো মোড — এখনও এআই-এর সাথে যুক্ত নয়', 'আবার চেষ্টা করুন', 'শিক্ষকের সাথে যোগাযোগ করা যাচ্ছে না। ইন্টারনেট দেখে আবার চেষ্টা করুন।', 'অনুবাদ হচ্ছে…',
  ],
  ht: [
    'Pwofesè AI', 'Tèks konvèsasyon an', 'Ou:', 'Pwofesè:',
    'Peze pou pale', 'M ap koute…', 'Pwofesè a ap pale…', 'M ap reflechi…', 'Sispann koute',
    'Oswa ekri repons ou la a', 'Voye', 'Kache', 'Montre', 'Kache tèks konvèsasyon an', 'Montre tèks konvèsasyon an',
    'Tradui an', 'Koute ankò', 'Peze pou tande pwofesè a',
    'Navigatè ou a pa ka tande w. Ekri pito.', 'Mikwofòn nan bloke. Pèmèt li nan paramèt navigatè a, oswa ekri pito.', 'Nou pa jwenn yon mikwofòn. Ekri pito.', 'Mwen pa t tande w. Peze pou eseye ankò.',
    'Ou pratike byen jodi a!', 'Rekòmanse', 'Mòd demo — poko konekte ak AI', 'Eseye ankò', 'Nou pa ka jwenn pwofesè a. Tcheke entènèt ou epi eseye ankò.', 'N ap tradui…',
  ],
  ko: [
    'AI 선생님', '대화 내용', '나:', '선생님:',
    '눌러서 말하기', '듣고 있어요…', '선생님이 말하고 있어요…', '생각 중…', '듣기 멈추기',
    '또는 여기에 답을 입력하세요', '보내기', '숨기기', '보기', '대화 내용 숨기기', '대화 내용 보기',
    '번역할 언어', '다시 듣기', '눌러서 선생님 말 듣기',
    '브라우저가 목소리를 들을 수 없어요. 대신 입력하세요.', '마이크가 차단되어 있어요. 브라우저 설정에서 허용하거나 대신 입력하세요.', '마이크를 찾을 수 없어요. 대신 입력하세요.', '잘 듣지 못했어요. 눌러서 다시 해 보세요.',
    '오늘 정말 잘 연습했어요!', '처음부터 다시', '데모 모드 — 아직 AI에 연결되지 않았어요', '다시 시도', '선생님과 연결할 수 없어요. 인터넷을 확인하고 다시 시도하세요.', '번역 중…',
  ],
  ar: [
    'معلّمة بالذكاء الاصطناعي', 'نص المحادثة', 'أنت:', 'المعلّمة:',
    'اضغط لتتكلم', 'جارٍ الاستماع…', 'المعلّمة تتكلم…', 'جارٍ التفكير…', 'إيقاف الاستماع',
    'أو اكتب إجابتك هنا', 'إرسال', 'إخفاء', 'إظهار', 'إخفاء نص المحادثة', 'إظهار نص المحادثة',
    'الترجمة إلى', 'استمع مرة أخرى', 'اضغط لتسمع المعلّمة',
    'متصفحك لا يستطيع سماعك. اكتب بدلاً من ذلك.', 'الميكروفون محظور. اسمح به من إعدادات المتصفح، أو اكتب بدلاً من ذلك.', 'لم نجد ميكروفوناً. اكتب بدلاً من ذلك.', 'لم أسمعك. اضغط لتحاول مرة أخرى.',
    'تدريب رائع اليوم!', 'ابدأ من جديد', 'وضع تجريبي — غير متصل بالذكاء الاصطناعي بعد', 'حاول مرة أخرى', 'لا يمكننا الوصول إلى المعلّمة. تحقق من الإنترنت وحاول مرة أخرى.', 'جارٍ الترجمة…',
  ],
  ur: [
    'اے آئی استاد', 'گفتگو کا متن', 'آپ:', 'استاد:',
    'بولنے کے لیے دبائیں', 'سن رہے ہیں…', 'استاد بول رہے ہیں…', 'سوچ رہے ہیں…', 'سننا بند کریں',
    'یا اپنا جواب یہاں لکھیں', 'بھیجیں', 'چھپائیں', 'دکھائیں', 'گفتگو کا متن چھپائیں', 'گفتگو کا متن دکھائیں',
    'ترجمے کی زبان', 'دوبارہ سنیں', 'استاد کی بات سننے کے لیے دبائیں',
    'آپ کا براؤزر آپ کی آواز نہیں سن سکتا۔ اس کے بجائے لکھیں۔', 'مائیکروفون بند ہے۔ براؤزر کی ترتیبات میں اجازت دیں، یا اس کے بجائے لکھیں۔', 'کوئی مائیکروفون نہیں ملا۔ اس کے بجائے لکھیں۔', 'آپ کی آواز سنائی نہیں دی۔ دوبارہ کوشش کرنے کے لیے دبائیں۔',
    'آج بہت اچھی مشق ہوئی!', 'دوبارہ شروع کریں', 'ڈیمو موڈ — ابھی اے آئی سے منسلک نہیں', 'دوبارہ کوشش کریں', 'استاد سے رابطہ نہیں ہو پا رہا۔ اپنا انٹرنیٹ چیک کریں اور دوبارہ کوشش کریں۔', 'ترجمہ ہو رہا ہے…',
  ],
  fr: [
    'Professeure IA', 'Transcription', 'Vous :', 'Professeure :',
    'Touchez pour parler', "J'écoute…", 'La professeure parle…', 'Réflexion…', "Arrêter l'écoute",
    'Ou écrivez votre réponse ici', 'Envoyer', 'Masquer', 'Afficher', 'Masquer la transcription', 'Afficher la transcription',
    'Traduire en', 'Réécouter', 'Touchez pour écouter la professeure',
    'Votre navigateur ne peut pas vous entendre. Écrivez votre réponse.', 'Le micro est bloqué. Autorisez-le dans les paramètres du navigateur, ou écrivez votre réponse.', 'Nous ne trouvons pas de micro. Écrivez votre réponse.', 'Je ne vous ai pas entendu. Touchez pour réessayer.',
    "Très bon entraînement aujourd'hui !", 'Recommencer', "Mode démo — pas encore connecté à l'IA", 'Réessayer', 'Impossible de joindre la professeure. Vérifiez votre connexion internet et réessayez.', 'Traduction…',
  ],
  pl: [
    'Nauczycielka AI', 'Zapis rozmowy', 'Ty:', 'Nauczycielka:',
    'Dotknij, aby mówić', 'Słucham…', 'Nauczycielka mówi…', 'Myślę…', 'Zatrzymaj słuchanie',
    'Albo wpisz tutaj swoją odpowiedź', 'Wyślij', 'Ukryj', 'Pokaż', 'Ukryj zapis rozmowy', 'Pokaż zapis rozmowy',
    'Przetłumacz na', 'Posłuchaj jeszcze raz', 'Dotknij, aby usłyszeć nauczycielkę',
    'Twoja przeglądarka cię nie słyszy. Napisz odpowiedź.', 'Mikrofon jest zablokowany. Zezwól na niego w ustawieniach przeglądarki albo napisz odpowiedź.', 'Nie znaleźliśmy mikrofonu. Napisz odpowiedź.', 'Nic nie słychać. Dotknij i spróbuj jeszcze raz.',
    'To był świetny trening!', 'Zacznij od nowa', 'Tryb demo — jeszcze bez połączenia z AI', 'Spróbuj ponownie', 'Nie możemy połączyć się z nauczycielką. Sprawdź internet i spróbuj ponownie.', 'Tłumaczenie…',
  ],
};

// English goes where window.t() looks for it; the other languages go into STRINGS.
Object.entries(CONVO_STRINGS).forEach(([code, values]) => {
  const target = code === 'en' ? ENGLISH_ONLY_IN_JS : STRINGS[code];
  CONVO_KEYS.forEach((key, i) => { target[key] = values[i]; });
});

(function () {
  const STORAGE_KEY = 'practice-english-language';
  const SITE_NAME = 'Practice English';
  const root = document.documentElement;
  const titleKey = root.dataset.titleKey;

  // Remember the English text that is already in the page.
  const english = new Map();
  document.querySelectorAll('[data-i18n]').forEach(el => english.set(el, el.textContent));
  const englishPlaceholders = new Map();
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => englishPlaceholders.set(el, el.placeholder));
  // Hints are extra lines shown under English text (like topic names) only when another language is picked.
  const hints = document.querySelectorAll('[data-i18n-hint]');
  let current = 'en';

  // For text that scripts write (not in the HTML).
  window.t = key => (STRINGS[current] && STRINGS[current][key]) || ENGLISH_ONLY_IN_JS[key] || key;
  window.currentLanguage = () => current;

  function saved() {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  }
  function save(code) {
    try { localStorage.setItem(STORAGE_KEY, code); } catch { /* private window: choice lasts this page only */ }
  }

  function apply(code) {
    const lang = LANGUAGES.find(l => l.code === code) || LANGUAGES[0];
    const dict = STRINGS[lang.code] || {};
    current = lang.code;
    english.forEach((text, el) => { el.textContent = dict[el.dataset.i18n] || text; });
    englishPlaceholders.forEach((text, el) => { el.placeholder = dict[el.dataset.i18nPlaceholder] || text; });
    hints.forEach(el => { el.textContent = dict[el.dataset.i18nHint] || ''; });
    root.lang = lang.code;
    root.dir = lang.rtl ? 'rtl' : 'ltr';
    if (titleKey) {
      const englishTitle = document.querySelector(`[data-i18n="${titleKey}"]`);
      const label = dict[titleKey] || (englishTitle && english.get(englishTitle));
      document.title = label ? `${label} · ${SITE_NAME}` : SITE_NAME;
    }
    document.querySelectorAll('.lang-menu button').forEach(b => {
      b.setAttribute('aria-current', b.dataset.code === lang.code ? 'true' : 'false');
    });
    document.dispatchEvent(new CustomEvent('languagechange', { detail: lang.code }));
  }

  // The menu only exists on pages that have the Choose Language button.
  const button = document.getElementById('lang-button');
  if (button) {
    const menu = document.createElement('div');
    menu.className = 'lang-menu';
    menu.id = 'lang-menu';
    menu.hidden = true;
    LANGUAGES.forEach(l => {
      const item = document.createElement('button');
      item.type = 'button';
      item.dataset.code = l.code;
      item.lang = l.code;
      item.innerHTML = '<span class="native"></span><span class="english"></span>';
      item.querySelector('.native').textContent = l.name;
      if (l.english !== l.name) item.querySelector('.english').textContent = l.english;
      item.addEventListener('click', () => {
        save(l.code);
        apply(l.code);
        close();
        button.focus();
      });
      menu.appendChild(item);
    });
    button.after(menu);
    button.setAttribute('aria-controls', 'lang-menu');
    button.setAttribute('aria-expanded', 'false');

    function open() {
      menu.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      (menu.querySelector('[aria-current="true"]') || menu.firstChild).focus();
    }
    function close() {
      menu.hidden = true;
      button.setAttribute('aria-expanded', 'false');
    }

    button.addEventListener('click', () => (menu.hidden ? open() : close()));
    document.addEventListener('click', e => {
      if (!menu.hidden && !menu.contains(e.target) && !button.contains(e.target)) close();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !menu.hidden) { close(); button.focus(); }
    });
    menu.addEventListener('keydown', e => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const items = [...menu.children];
      const i = items.indexOf(document.activeElement);
      const next = e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
      items[next].focus();
    });
  }

  apply(saved() || 'en');
})();
