import { zh, type Rule } from "./rules";

/**
 * 文案：界面文字怎么写。「文案」页照这份数据渲染。
 * 新增或修改界面文字、提示和译文前先看这里，规则只在这一处维护。
 */
export const TEXT_RULES: Rule[] = [
  // A shell connection needs its subject named even when the icon already conveys the state.
{
  "id": "sidebarConnection",
  "title": {
    "zh-CN": "侧栏底部的连接与服务状态使用 SidebarStatus。",
    "zh-TW": "側欄底部的連線與服務狀態使用 SidebarStatus。",
    "en-US": "Use SidebarStatus for connection and service states in the shell foot.",
    "ja-JP": "サイドバー下部の接続やサービスの状態には SidebarStatus を使う。",
    "ko-KR": "사이드바 하단의 연결 및 서비스 상태에는 SidebarStatus를 사용한다.",
    "fr-FR": "Utiliser SidebarStatus pour les états de connexion et de service en bas de la barre latérale.",
    "es-ES": "Usar SidebarStatus para los estados de conexión y servicio al pie de la barra lateral.",
    "ru-RU": "Для состояния соединений и служб внизу боковой панели использовать SidebarStatus."
  },
  "list": [
    {
      "zh-CN": "状态图标配合对象与状态文字，例如「店铺在线」。在线用 online，离线用 offline，错误用 alert，待登录用 scan。颜色只用于图标，文字使用次要文字色；不单独放「在线」等彩色词语，不画胶囊、底色或圆点。收起后仅显示图标，完整文字用作 Tooltip 和无障碍名称。",
      "zh-TW": "狀態圖示配合對象與狀態文字，例如「店鋪在線」。在線用 online，離線用 offline，錯誤用 alert，待登入用 scan。顏色只用於圖示，文字使用次要文字色；不單獨放「在線」等彩色詞語，不畫膠囊、底色或圓點。收起後僅顯示圖示，完整文字用作 Tooltip 和無障礙名稱。",
      "en-US": "Pair a state icon with a label naming the subject and state, such as “Shop online”. Use online, offline, alert for errors and scan for login. Apply tone only to the icon and secondary ink to the label. Never use a bare colored state word, pill, fill or dot. When collapsed, show only the icon and keep the full label as its Tooltip and accessible name.",
      "ja-JP": "状態アイコンと対象・状態を示す文字（「店舗オンライン」など）を組み合わせる。接続中は online、切断は offline、エラーは alert、ログイン待ちは scan を使う。色はアイコンだけに付け、文字は補助色にする。状態の単語だけを色付きで置かず、カプセル、背景色、点を付けない。折りたたみ時はアイコンだけを表示し、全文を Tooltip とアクセシブルな名前に使う。",
      "ko-KR": "상태 아이콘과 대상 및 상태를 나타내는 문구(예: ‘매장 온라인’)를 함께 사용한다. 온라인은 online, 오프라인은 offline, 오류는 alert, 로그인 대기는 scan을 사용한다. 색상은 아이콘에만 적용하고 문구에는 보조 글자색을 사용한다. 색이 있는 상태 단어만 놓거나 캡슐, 배경색, 점을 넣지 않는다. 접으면 아이콘만 표시하고 전체 문구를 Tooltip과 접근성 이름으로 유지한다.",
      "fr-FR": "Associer une icône à un libellé nommant le sujet et son état, par exemple « Boutique en ligne ». Utiliser online, offline, alert pour les erreurs et scan pour la connexion au compte. Colorer uniquement l’icône ; le texte garde la couleur secondaire. Aucun mot d’état coloré isolé, capsule, fond ou point. En mode réduit, garder seulement l’icône et utiliser le libellé complet comme Tooltip et nom accessible.",
      "es-ES": "Combinar un icono con un texto que nombre el sujeto y su estado, como « Tienda en línea ». Usar online, offline, alert para errores y scan para iniciar sesión. Aplicar el color solo al icono y el color secundario al texto. No usar palabras de estado coloreadas y aisladas, cápsulas, fondos ni puntos. Al contraer, mostrar solo el icono y mantener el texto completo como Tooltip y nombre accesible.",
      "ru-RU": "Сочетать значок с подписью, называющей объект и состояние, например «Магазин в сети». Использовать online, offline, alert для ошибок и scan для входа. Цвет состояния применять только к значку, текст оставлять вторичным. Не использовать отдельное цветное слово, капсулу, заливку или точку. При сворачивании оставлять значок, а полную подпись использовать как Tooltip и доступное имя."
    }
  ],
  "examples": []
},
  {
    id: "iconIdentifies",
    title: {
      "zh-CN": "图标已标明的平台、文件类型或状态，不在同一视图中重复写成文字；侧栏连接与服务状态遵循 SidebarStatus 规则。",
      "zh-TW": "圖示已標明的平台、檔案類型或狀態，不在同一檢視中重複寫成文字；側欄連線與服務狀態遵循 SidebarStatus 規則。",
      "en-US": "Do not repeat a platform, file type or status as text in the same view when its icon " +
        "already identifies it; shell connection and service states follow the SidebarStatus rule.",
      "ja-JP": "アイコンで示したプラットフォーム、ファイル形式、状態を同じ画面の文字で繰り返さない。ただしサイドバーの接続やサービスの状態は SidebarStatus の規則に従う。",
      "ko-KR": "아이콘이 이미 나타내는 플랫폼, 파일 형식, 상태를 같은 화면에서 글자로 반복하지 않는다. 사이드바의 연결 및 서비스 상태는 SidebarStatus 규칙을 따른다.",
      "fr-FR": "Ne pas répéter en texte une plateforme, un type de fichier ou un état déjà identifié par" +
        " son icône dans la même vue ; les états de connexion et de service de la barre latérale suivent la règle SidebarStatus.",
      "es-ES": "No repetir como texto una plataforma, un tipo de archivo o un estado que su icono ya " +
        "identifica en la misma vista; los estados de conexión y servicio de la barra lateral siguen la regla SidebarStatus.",
      "ru-RU": "Не повторять текстом платформу, тип файла или состояние, уже обозначенные значком в том " +
        "же представлении; состояния соединений и служб в боковой панели следуют правилу SidebarStatus.",
    },
    examples: [],
  },
  {
    id: "core",
    title: {
      "zh-CN": "核心原则",
      "zh-TW": "核心原則",
      "en-US": "Core principles",
      "ja-JP": "基本原則",
      "ko-KR": "핵심 원칙",
      "fr-FR": "Principes fondamentaux",
      "es-ES": "Principios básicos",
      "ru-RU": "Основные принципы",
    },
    list: [
      {
        "zh-CN": "平实克制：界面标签、设置说明、提示、状态栏、报错弹窗与帮助文档统一使用完整、简明的现代汉语。直接说明事实、参数作用与操作结果；不煽情、不抖机灵、不用营销口号或保姆式口吻，也不写成冗长的公文或文艺散文。",
        "zh-TW": "平實克制：介面標籤、設定說明、提示、狀態列、報錯彈窗與說明文件統一使用完整、簡明的現代漢語。直接說明事實、參數作用與操作結果；不煽情、不抖機靈、不用行銷口號或保姆式口吻，也不寫成冗長的公文或文藝散文。",
        "en-US": "Plain and direct: labels, setting descriptions, tooltips, status bars, error dialogs and help documents all use complete, concise prose. State facts, what a parameter does and what an action results in. No hype, quips, marketing slogans or patronizing hand-holding, and no stiff bureaucratic phrasing or flowery prose.",
        "ja-JP": "平易で端的に：ラベル、設定の説明、ヒント、ステータスバー、エラーダイアログ、ヘルプ文書は、簡潔で分かりやすい文で書きます。事実、パラメーターの働き、操作の結果だけを述べ、煽りや軽口、過剰な比喩、冗長なお役所言葉や美文調は避けます。",
        "ko-KR": "평이하고 간결하게: 라벨, 설정 설명, 도움말, 상태 표시줄, 오류 대화 상자, 도움말 문서는 간결하고 명확한 문장으로 쓴다. 사실, 매개변수의 역할, 조작의 결과만 서술한다. 과장, 농담, 마케팅 문구, 지나치게 친절한 설명투는 물론 딱딱한 공문체와 미문도 쓰지 않는다.",
        "fr-FR": "Simple et direct : libellés, descriptions des réglages, info-bulles, barres d'état, boîtes d'erreur et documents d'aide utilisent une prose claire et concise. Énoncer les faits, le rôle d'un paramètre et le résultat d'une action. Sans emphase, traits d'esprit, slogans ni ton paternaliste, ni style administratif lourd ou littéraire.",
        "es-ES": "Claro y directo: etiquetas, descripciones de ajustes, ayudas, barras de estado, cuadros de error y documentos de ayuda usan una prosa clara y concisa. Se exponen hechos, la función de cada parámetro y el resultado de cada acción. Sin exageraciones, ocurrencias, eslóganes ni tono paternalista, y sin prosa burocrática ni recargada.",
        "ru-RU": "Просто и по делу: подписи, описания настроек, подсказки, строки состояния, окна ошибок и справка пишутся ясным и кратким языком. Излагаются факты, назначение параметра и результат действия. Без пафоса, шуток, рекламных лозунгов, покровительственного тона, канцелярита и вычурности.",
      },
      {
        "zh-CN": "不暴露内部实现：面向用户的界面只说明概念与功能，不出现内部进程名、脚本文件名、代码枚举前缀或研发用语（如 worker、render、落地、热更）。",
        "zh-TW": "不暴露內部實現：面向使用者的介面只說明概念與功能，不出現內部程序名、指令碼檔名、程式碼列舉字首或研發用語（如 worker、render、落地、熱更）。",
        "en-US": "Do not expose internals: the user-facing interface describes concepts and features only, without internal process names, script file names, code enum prefixes or developer slang (such as worker, render, hot update).",
        "ja-JP": "内部の実装を見せない：利用者向けの画面では概念と機能だけを説明し、内部のプロセス名、スクリプトのファイル名、コードの列挙型の接頭辞、開発者の俗語（worker、render、ホットアップデートなど）を出しません。",
        "ko-KR": "내부 구현을 드러내지 않는다: 사용자 화면에서는 개념과 기능만 설명하고, 내부 프로세스 이름, 스크립트 파일 이름, 코드 열거형 접두사, 개발 은어(worker, render, 핫 업데이트 등)를 쓰지 않는다.",
        "fr-FR": "Ne pas exposer les mécanismes internes : l'interface destinée aux utilisateurs décrit seulement les notions et les fonctions, sans noms de processus internes, noms de scripts, préfixes d'énumérations ni argot de développeur (worker, render, mise à jour à chaud, etc.).",
        "es-ES": "No mostrar el funcionamiento interno: la interfaz para el usuario describe solo conceptos y funciones, sin nombres de procesos internos, nombres de scripts, prefijos de enumeraciones ni jerga de desarrollo (worker, render, actualización en caliente, etc.).",
        "ru-RU": "Не раскрывать внутреннее устройство: интерфейс для пользователя описывает только понятия и функции, без имён внутренних процессов, имён файлов сценариев, префиксов перечислений и жаргона разработчиков (worker, render, горячее обновление и т. п.).",
      },
      {
        "zh-CN": "需要亲切处保持亲切：里程碑致谢、求关注弹窗、彩蛋文字与新手引导使用自然、真诚的语气，不写成公文通知。",
        "zh-TW": "需要親切處保持親切：里程碑致謝、求關注彈窗、彩蛋文字與新手引導使用自然、真誠的語氣，不寫成公文通知。",
        "en-US": "Stay warm where warmth is intended: milestone thanks, follow requests, easter eggs and first-time guidance keep a natural, sincere tone and are not written as official notices.",
        "ja-JP": "親しみが求められる所では親しみを保つ：節目のお礼、フォローのお願い、隠し要素の文、初心者向けの案内は自然で誠実な口調にし、公文書のような通知にしません。",
        "ko-KR": "친근해야 할 곳은 친근하게: 이정표 감사 인사, 팔로우 요청, 숨은 문구, 처음 사용자 안내는 자연스럽고 진솔한 어조로 쓰며 공문 같은 알림으로 쓰지 않는다.",
        "fr-FR": "Rester chaleureux là où c'est voulu : remerciements d'étape, demandes d'abonnement, easter eggs et guides de première utilisation gardent un ton naturel et sincère, sans style de note administrative.",
        "es-ES": "Mantener la cercanía donde se busca: agradecimientos por hitos, peticiones de seguimiento, textos ocultos y guías para principiantes conservan un tono natural y sincero, sin estilo de notificación oficial.",
        "ru-RU": "Сохранять теплоту там, где она задумана: благодарности за достижения, просьбы подписаться, пасхалки и подсказки для новичков пишутся естественным, искренним тоном, а не как официальные уведомления.",
      },
      {
        "zh-CN": "测试数据不进语言包：正式语言包（i18n/locales/*.json）只收录实际使用的界面文字，单元测试的假数据保留在测试文件中。",
        "zh-TW": "測試資料不進語言包：正式語言包（i18n/locales/*.json）只收錄實際使用的介面文字，單元測試的假資料保留在測試檔案中。",
        "en-US": "Keep test data out of the language packs: the language packs (i18n/locales/*.json) hold only interface text that is actually used; unit test placeholder data stays in the test files.",
        "ja-JP": "テスト用データを言語パックに入れない：言語パック（i18n/locales/*.json）には実際に使う画面の文字だけを収め、単体テストの仮データはテストファイルの中に置きます。",
        "ko-KR": "테스트 데이터는 언어 팩에 넣지 않는다: 언어 팩(i18n/locales/*.json)에는 실제로 쓰는 화면 문구만 넣고, 단위 테스트용 가짜 데이터는 테스트 파일 안에 둔다.",
        "fr-FR": "Garder les données de test hors des packs de langue : les packs (i18n/locales/*.json) ne contiennent que les textes réellement utilisés ; les données fictives des tests unitaires restent dans les fichiers de test.",
        "es-ES": "Mantener los datos de prueba fuera de los paquetes de idioma: los paquetes (i18n/locales/*.json) solo contienen textos que se usan de verdad; los datos ficticios de las pruebas unitarias se quedan en los archivos de prueba.",
        "ru-RU": "Тестовые данные не попадают в языковые пакеты: пакеты (i18n/locales/*.json) содержат только реально используемые тексты интерфейса, а заглушки модульных тестов остаются в файлах тестов.",
      },
      {
        "zh-CN": "翻译使用领域术语：算法、协议与命令保留原名，其余使用软件领域通行的母语词汇，不脱离上下文逐字直译。",
        "zh-TW": "翻譯使用領域術語：演算法、協議與命令保留原名，其餘使用軟體領域通行的母語詞彙，不脫離上下文逐字直譯。",
        "en-US": "Translate with domain terms: algorithms, protocols and commands keep their original names; everything else uses the established native terms of the software field, never word-for-word translation out of context.",
        "ja-JP": "翻訳では分野の用語を使う：アルゴリズム、プロトコル、コマンドは元の名前のままにし、それ以外はソフトウェア分野で定着した母語の用語を使います。文脈を無視した逐語訳はしません。",
        "ko-KR": "번역은 분야 용어를 따른다: 알고리즘, 프로토콜, 명령은 원래 이름을 유지하고, 나머지는 소프트웨어 분야에서 통용되는 모국어 용어를 쓴다. 맥락을 벗어난 직역은 하지 않는다.",
        "fr-FR": "Traduire avec les termes du domaine : algorithmes, protocoles et commandes gardent leur nom d'origine ; le reste emploie les termes établis du logiciel dans la langue cible, jamais de traduction mot à mot hors contexte.",
        "es-ES": "Traducir con los términos del sector: algoritmos, protocolos y comandos conservan su nombre original; lo demás usa los términos asentados del software en la lengua de destino, nunca traducciones literales fuera de contexto.",
        "ru-RU": "Переводить с отраслевыми терминами: алгоритмы, протоколы и команды сохраняют исходные названия, остальное передаётся устоявшимися терминами программной отрасли, без дословного перевода вне контекста.",
      },
    ],
    examples: [
    ],
  },
  {
    id: "joiners",
    title: {
      "zh-CN": "不用分割线、分隔点和破折号拼凑内容",
      "zh-TW": "不用分隔線、分隔點和破折號拼湊內容",
      "en-US": "Do not string content together with lines, dots or dashes",
      "ja-JP": "区切り線、中黒、ダッシュで内容をつながない",
      "ko-KR": "구분선, 가운뎃점, 줄표로 내용을 이어 붙이지 않는다",
      "fr-FR": "Ne pas assembler le contenu avec des traits, des points médians ou des tirets",
      "es-ES": "No unir contenido con líneas, puntos medios ni guiones",
      "ru-RU": "Не склеивать содержимое линиями, точками и тире",
    },
    lead: [
      {
        "zh-CN": "界面文字使用完整、简明的陈述句，或「名称：值」的字段。不用横线、「·」或「——」将几个词连成一行，也不用横线将卡片分成几段。",
        "zh-TW": "介面文字使用完整、簡明的陳述句，或「名稱：值」的欄位。不用橫線、「·」或「——」將幾個詞連成一行，也不用橫線將卡片分成幾段。",
        "en-US": "Interface text uses complete, concise sentences or \"name: value\" fields. Do not join several words into one line with lines, \"·\" or dashes, and do not cut a card into sections with horizontal rules.",
        "ja-JP": "画面の文章は、完結で簡潔な平叙文か「名前：値」の項目で書きます。線、「・」、ダッシュで複数の語を一行につなげたり、横線でカードを区切ったりしません。",
        "ko-KR": "화면 문구는 완결되고 간결한 평서문이나 \"이름: 값\" 항목으로 쓴다. 선, \"·\", 줄표로 여러 단어를 한 줄에 잇거나 가로줄로 카드를 나누지 않는다.",
        "fr-FR": "Les textes de l'interface sont des phrases complètes et concises, ou des champs « nom : valeur ». On ne relie pas plusieurs mots sur une ligne avec des traits, des « · » ou des tirets, et on ne découpe pas une carte avec des filets horizontaux.",
        "es-ES": "Los textos de la interfaz son oraciones completas y concisas, o campos «nombre: valor». No se unen varias palabras en una línea con rayas, «·» o guiones, ni se divide una tarjeta con líneas horizontales.",
        "ru-RU": "Тексты интерфейса — это полные и краткие предложения или поля «название: значение». Не соединяйте несколько слов в одну строку чертами, «·» или тире и не делите карточку горизонтальными линиями.",
      },
      {
        "zh-CN": "用符号连接的一行无法表明每一段的含义及段与段之间的关系。分区使用底色与留白，不使用分割线。",
        "zh-TW": "用符號連線的一行無法表明每一段的含義及段與段之間的關係。分割槽使用底色與留白，不使用分割線。",
        "en-US": "A line joined by symbols does not say what each part means or how the parts relate. Separate areas with background colour and spacing, not lines.",
        "ja-JP": "記号でつないだ一行では、各部分の意味も部分同士の関係もわかりません。区切りは背景色と余白で行い、線は使いません。",
        "ko-KR": "기호로 이은 한 줄은 각 부분의 뜻도, 부분 사이의 관계도 알려 주지 않는다. 구역은 배경색과 여백으로 나누고 선은 쓰지 않는다.",
        "fr-FR": "Une ligne reliée par des symboles ne dit ni ce que signifie chaque partie, ni comment elles s'articulent. Séparer les zones par la couleur de fond et l'espacement, pas par des traits.",
        "es-ES": "Una línea unida con símbolos no indica qué significa cada parte ni cómo se relacionan. Las zonas se separan con color de fondo y espacio, no con líneas.",
        "ru-RU": "Строка, собранная через символы, не сообщает, что означает каждая часть и как части связаны. Области разделяются цветом фона и отступами, а не линиями.",
      },
    ],
    examples: [
      {
        source: "RVC Fabric (s.engineCmdBusy)",
        pairs: {
          "en-US": ["Engine is busy — the previous command has not been picked up yet. Try again in a moment.", "The engine is busy and has not picked up the previous command yet. Try again in a moment."],
          "fr-FR": ["Le moteur est occupé — la commande précédente n'a pas encore été prise en compte. Réessayez dans un instant.", "Le moteur est occupé. La commande précédente n'a pas encore été prise en compte. Réessayez dans un instant."],
          "ru-RU": ["Движок занят — предыдущая команда ещё не принята. Повторите через мгновение.", "Движок занят. Предыдущая команда ещё не принята. Повторите через мгновение."],
        },
      },
      {
        source: "RVC Fabric (msg.train.kmeans_failed)",
        pairs: {
          "en-US": ["Clustering failed — falling back to all features: {error}", "Clustering failed. Falling back to all features: {error}"],
          "fr-FR": ["Échec du regroupement — repli sur toutes les caractéristiques : {error}", "Échec du regroupement. Repli sur toutes les caractéristiques : {error}"],
          "ru-RU": ["Кластеризация не удалась — используем все признаки: {error}", "Кластеризация не удалась. Используем все признаки: {error}"],
        },
      },
      {
        source: "RVC Fabric (s.dlWhyDisk)",
        pairs: {
          "zh-CN": ["磁盘空间不足，无法写入。请清理空间后重试——运行时解压后约需十几 GB。", "磁盘空间不足，无法写入。运行环境解压后约需十几 GB，请清理空间后重试。"],
          "zh-TW": ["磁碟空間不足，無法寫入。請清理空間後重試——執行時解壓後約需十幾 GB。", "磁碟空間不足，無法寫入。執行環境解壓後約需十幾 GB，請清理空間後重試。"],
          "en-US": ["The disk is out of space. Please free up space and try again; the runtime needs over 10 GB once unpacked.", "The disk is out of space. The runtime environment needs over 10 GB once unpacked. Free up space and try again."],
          "ja-JP": ["ディスクの空き容量が足りません。空けてから再試行してください（ランタイムは展開後 10 GB 超）。", "ディスクの空き容量が足りません。実行環境は展開後に 10 GB 以上必要です。空き容量を確保してから再試行してください。"],
          "ko-KR": ["디스크 공간이 부족합니다. 공간을 확보한 뒤 다시 시도하세요 — 런타임은 압축 해제 후 10 GB 이상 필요합니다.", "디스크 공간이 부족합니다. 실행 환경은 압축 해제 후 10 GB 이상 필요합니다. 공간을 확보한 뒤 다시 시도하십시오."],
          "fr-FR": ["Le disque est plein. Libérez de l'espace et réessayez ; le runtime dépasse dix Go une fois décompressé.", "Le disque est plein. L'environnement d'exécution occupe plus de 10 Go une fois décompressé. Libérez de l'espace et réessayez."],
          "es-ES": ["No queda espacio en disco. Libera espacio e inténtalo de nuevo; el runtime ocupa más de diez GB descomprimido.", "No queda espacio en disco. El entorno de ejecución ocupa más de 10 GB descomprimido. Libere espacio e inténtelo de nuevo."],
          "ru-RU": ["На диске нет места. Освободите его и повторите; распакованный рантайм занимает более десяти ГБ.", "На диске нет места. Распакованная среда выполнения занимает более 10 ГБ. Освободите место и повторите попытку."],
        },
      },
      {
        source: "RVC Fabric (msg.sts.empty_fields)",
        pairs: {
          "zh-CN": ["输入 / 输出 / 音色模型 都不能为空", "输入、输出和音色模型都不能为空"],
          "zh-TW": ["輸入 / 輸出 / 音色模型 都不能為空", "輸入、輸出和音色模型都不能為空"],
          "ja-JP": ["入力 / 出力 / ボイスモデル はいずれも必須です", "入力、出力、ボイスモデルはいずれも必須です"],
          "ko-KR": ["입력 / 출력 / 음색 모델 모두 필요합니다", "입력, 출력, 음색 모델은 모두 필수입니다"],
          "ru-RU": ["Вход, выход и модель голоса — все обязательны", "Вход, выход и модель голоса обязательны"],
        },
      },
      {
        source: "RVC Fabric (s.5695956a42)",
        pairs: {
          "zh-CN": ["想让游戏 / 语音 里的人听到变声，必须先装虚拟声卡（VB-Cable）。 装完重启一次电脑，设备列表里才会出现 CABLE Input / CABLE Output。", "如需让游戏或语音软件中的其他人听到变声，必须先安装虚拟声卡（VB-Cable）。安装后需重启一次电脑，设备列表中才会出现 CABLE Input 和 CABLE Output。"],
          "zh-TW": ["想讓遊戲 / 語音 裡的人聽到變聲，必須先裝虛擬音效卡（VB-Cable）。 裝完重啟一次電腦，裝置列表裡才會出現 CABLE Input / CABLE Output。", "如需讓遊戲或語音軟體中的其他人聽到變聲，必須先安裝虛擬音效卡（VB-Cable）。安裝後需重新啟動一次電腦，裝置列表中才會出現 CABLE Input 和 CABLE Output。"],
          "en-US": ["To let people in games / voice chat hear you, the VB-Cable virtual sound card is required. Restart the PC after installing, or CABLE Input / Output won't appear.", "For people in games or voice chat to hear the converted voice, the VB-Cable virtual sound card is required. Restart the computer after installing it; CABLE Input and CABLE Output appear in the device list only after the restart."],
          "ja-JP": ["ゲームやボイスチャットの相手に変換後の声を聞かせるには、仮想サウンドカード（VB-Cable）のインストールが必須です。インストール後は PC を再起動しないと CABLE Input / CABLE Output がデバイスリストに表示されません。", "ゲームやボイスチャットの相手に変換後の声を聞かせるには、仮想サウンドカード（VB-Cable）のインストールが必須です。インストール後は PC を再起動しないと、CABLE Input と CABLE Output がデバイスリストに表示されません。"],
          "ko-KR": ["게임이나 음성 채팅의 상대방이 변조된 목소리를 듣게 하려면 가상 사운드 카드(VB-Cable)가 필수입니다. 설치 후 PC를 한 번 재시작해야 CABLE Input / CABLE Output이 장치 목록에 나타납니다.", "게임이나 음성 채팅의 상대방이 변조된 목소리를 듣게 하려면 가상 사운드 카드(VB-Cable)가 필수입니다. 설치 후 PC를 한 번 재시작해야 CABLE Input과 CABLE Output이 장치 목록에 나타납니다."],
          "fr-FR": ["Pour que les autres vous entendent dans le jeu/chat, il faut la carte son virtuelle (VB-Cable). Après installation, redémarrez le PC, sinon CABLE Input / Output n'apparaîtront pas.", "Pour que les autres entendent la voix convertie dans un jeu ou une discussion vocale, la carte son virtuelle VB-Cable est nécessaire. Après l'installation, redémarrez l'ordinateur ; CABLE Input et CABLE Output n'apparaissent dans la liste des périphériques qu'après le redémarrage."],
          "es-ES": ["Para que en el juego/chat oigan tu voz convertida hace falta la tarjeta virtual (VB-Cable). Tras instalarla, reinicia el PC o CABLE Input / Output no aparecerán.", "Para que en juegos o chats de voz oigan la voz convertida, se necesita la tarjeta de sonido virtual VB-Cable. Tras instalarla, reinicie el equipo; CABLE Input y CABLE Output solo aparecen en la lista de dispositivos después del reinicio."],
          "ru-RU": ["Чтобы собеседники в игре/чате слышали измененный голос, нужна виртуальная звуковая карта (VB-Cable). После установки перезагрузите компьютер, иначе CABLE Input / Output не появятся.", "Чтобы собеседники в играх и голосовых чатах слышали изменённый голос, нужна виртуальная звуковая карта VB-Cable. После установки перезагрузите компьютер: CABLE Input и CABLE Output появятся в списке устройств только после перезагрузки."],
        },
      },
      zh("卡片里输入框、选项行、按钮行之间各画一条横线。\n<div className=\"flex items-center gap-2 pt-2.5 mt-2 border-t border-[var(--hairline)]\">…</div>", "同一张卡片里的几行只用间距隔开；确实是另一组内容，就放进另一个 --group 底色块。\n<div className=\"flex items-center gap-2 mt-3\">…</div>", "分割线"),
      zh("厦大 · 生殖泌尿科 · 册主任 · 30项验收通过", "厦门大学生殖泌尿科册主任主持的验收已完成，30 项全部通过。", "分隔点"),
      zh("v2ProPlus · 未填写作者", "模型版本：v2ProPlus\n作者：未填写", "分隔点"),
      zh("15:51 · 1.5 s · alice_test · 种子 1092174532", "角色：alice_test\n时长：1.5 秒\n随机种子：1092174532", "分隔点"),
      zh("厦大——生殖泌尿科——册主任——30项验收通过", "厦门大学生殖泌尿科册主任主持的验收已完成，30 项全部通过。", "破折号"),
      zh("当前是纯网页预览——窗口按钮、托盘一律安静降级。", "当前是网页预览。窗口按钮和托盘需要桌面程序，在网页中不可用。", "破折号"),
      zh("有效时长　—", "有效时长：未检测", "破折号"),
      zh("用「·」或「——」把几个名词串成一行", "写成完整的陈述句，主语、谓语齐全"),
      zh("只给值不给名称，让读的人猜每一段是什么", "多项信息写成「名称：值」，每项一行，或排成两列"),
      zh("用简称或缩写，例如「厦大」「种子」", "用全称，例如「厦门大学」「随机种子」"),
      zh("用「—」或空白占位", "值缺失时写明原因，例如「未检测」「未填写」"),
      zh("每组控件之间加一条 border-t", "同一张卡片里的几行只用间距隔开"),
      zh("把所有字段挤进一行再用符号隔开", "列表空间不够时少放几项，其余放进详情"),
    ],
    note: {
      "zh-CN": "此条仅适用于界面文字与布局，代码注释与开发文档不受约束。",
      "zh-TW": "此條僅適用於介面文字與佈局，程式碼註釋與開發文件不受約束。",
      "en-US": "This rule covers interface text and layout only. Code comments and developer documents are not bound by it.",
      "ja-JP": "この規則は画面の文章とレイアウトだけが対象です。コードのコメントと開発用の文書は対象外です。",
      "ko-KR": "이 규칙은 화면 문구와 레이아웃에만 적용된다. 코드 주석과 개발 문서는 대상이 아니다.",
      "fr-FR": "Cette règle ne concerne que les textes et la mise en page de l'interface. Les commentaires du code et la documentation technique n'y sont pas soumis.",
      "es-ES": "Esta regla solo afecta a los textos y la disposición de la interfaz. Los comentarios del código y la documentación técnica no están sujetos a ella.",
      "ru-RU": "Это правило касается только текстов и разметки интерфейса. Комментарии в коде и документация для разработчиков под него не подпадают.",
    },
  },
  {
    id: "plain",
    title: {
      "zh-CN": "用用户听得懂的话",
      "zh-TW": "用使用者聽得懂的話",
      "en-US": "Use words the user understands",
      "ja-JP": "利用者に伝わる言葉を使う",
      "ko-KR": "사용자가 이해하는 말을 쓴다",
      "fr-FR": "Employer des mots que l'utilisateur comprend",
      "es-ES": "Usar palabras que el usuario entienda",
      "ru-RU": "Писать словами, понятными пользователю",
    },
    lead: [
      {
        "zh-CN": "界面文字面向用户，而非开发者。不使用内部术语、行话与口语缩略，数字须附完整的单位与含义。不加分隔的一串词组同样不符合要求。",
        "zh-TW": "介面文字面向使用者，而非開發者。不使用內部術語、行話與口語縮略，數字須附完整的單位與含義。不加分隔的一串片語同樣不符合要求。",
        "en-US": "Interface text is written for users, not developers. Avoid internal terms, jargon and casual abbreviations, and give every number its full unit and meaning. A string of fragments without separators fails just the same.",
        "ja-JP": "画面の文章は開発者ではなく利用者に向けて書きます。内部用語、業界用語、くだけた略語は使わず、数値には単位と意味を省略せずに添えます。区切り記号がなくても、語句を並べただけのものは不合格です。",
        "ko-KR": "화면 문구는 개발자가 아니라 사용자를 위해 쓴다. 내부 용어, 업계 은어, 구어체 줄임말을 쓰지 않고, 숫자에는 단위와 의미를 온전히 붙인다. 구분 기호가 없더라도 단어를 나열하기만 한 것은 마찬가지로 부적합하다.",
        "fr-FR": "Les textes de l'interface s'adressent aux utilisateurs, pas aux développeurs. Pas de termes internes, de jargon ni d'abréviations familières ; chaque nombre porte son unité complète et son sens. Une suite de fragments sans séparateurs ne convient pas davantage.",
        "es-ES": "Los textos de la interfaz se dirigen a los usuarios, no a los desarrolladores. Sin términos internos, jerga ni abreviaturas coloquiales; cada número lleva su unidad completa y su significado. Una serie de fragmentos sin separadores tampoco es aceptable.",
        "ru-RU": "Тексты интерфейса пишутся для пользователей, а не для разработчиков. Без внутренних терминов, жаргона и разговорных сокращений; у каждого числа есть полная единица измерения и смысл. Набор обрывков без разделителей тоже не годится.",
      },
    ],
    examples: [
      {
        source: "RVC Fabric (s.computeBackendWarn)",
        pairs: {
          "zh-CN": ["已安装 N 卡运行时，但当前未使用 CUDA。请将「主显卡」改回「自动（不指定）」，或更新 NVIDIA 驱动后重试。", "已安装 NVIDIA 显卡的运行环境，但当前未使用 CUDA。请将「主显卡」改回「自动（不指定）」，或更新 NVIDIA 驱动后重试。"],
          "zh-TW": ["已安裝 N 卡執行環境，但目前未使用 CUDA。請將「主顯示卡」改回「自動（不指定）」，或更新 NVIDIA 驅動後重試。", "已安裝 NVIDIA 顯示卡的執行環境，但目前未使用 CUDA。請將「主顯示卡」改回「自動（不指定）」，或更新 NVIDIA 驅動後重試。"],
          "en-US": ["The NVIDIA runtime is installed, but CUDA is not in use. Revert “Primary GPU” to “Automatic”, or update your NVIDIA driver and try again.", "The NVIDIA runtime environment is installed, but CUDA is not in use. Set “Primary GPU” back to “Automatic”, or update the NVIDIA driver and try again."],
          "ja-JP": ["NVIDIA 版ランタイムが導入されていますが、CUDA が使用されていません。「メイン GPU」を「自動（指定しない）」に戻すか、NVIDIA ドライバを更新して再試行してください。", "NVIDIA 用の実行環境が導入されていますが、CUDA が使用されていません。「メイン GPU」を「自動（指定しない）」に戻すか、NVIDIA ドライバを更新して再試行してください。"],
          "ko-KR": ["NVIDIA 런타임이 설치되어 있으나 CUDA가 사용되지 않습니다. “주 GPU”를 “자동(지정 안 함)”으로 되돌리거나 NVIDIA 드라이버를 업데이트한 후 다시 시도하십시오.", "NVIDIA용 실행 환경이 설치되어 있으나 CUDA가 사용되지 않습니다. “주 GPU”를 “자동(지정 안 함)”으로 되돌리거나 NVIDIA 드라이버를 업데이트한 후 다시 시도하십시오."],
          "fr-FR": ["Le runtime NVIDIA est installé, mais CUDA n’est pas utilisé. Rétablissez « GPU principal » sur « Automatique », ou mettez à jour le pilote NVIDIA puis réessayez.", "L’environnement d’exécution NVIDIA est installé, mais CUDA n’est pas utilisé. Rétablissez « GPU principal » sur « Automatique », ou mettez à jour le pilote NVIDIA puis réessayez."],
          "es-ES": ["El runtime de NVIDIA está instalado, pero no se está usando CUDA. Vuelva a poner «GPU principal» en «Automático» o actualice el controlador NVIDIA e inténtelo de nuevo.", "El entorno de ejecución de NVIDIA está instalado, pero no se está usando CUDA. Vuelva a poner «GPU principal» en «Automático» o actualice el controlador NVIDIA e inténtelo de nuevo."],
        },
      },
      zh("首包 2828 ms　已出 3 段　已用 3.7 s", "已生成 3 段语音，用时 3.7 秒，其中第一段用时 2.8 秒。"),
      zh("写开发者的术语，例如「首包」「TTFB」", "写使用者熟悉的说法，例如「第一段语音」"),
      zh("用缩略的说法，例如「已出」", "用完整的动词，例如「已生成」"),
      zh("正文里混用 s、ms", "单位写成文字，例如「秒」「毫秒」"),
      zh("进行中显示一种计时，结束后换成另一种", "同一处的几个数字口径一致，例如都从点击开始计时"),
    ],
  },
  {
    id: "once",
    title: {
      "zh-CN": "同一句话只出现一处",
      "zh-TW": "同一句話只出現一處",
      "en-US": "Say each thing in one place only",
      "ja-JP": "同じ内容は一か所だけに書く",
      "ko-KR": "같은 말은 한 곳에만 쓴다",
      "fr-FR": "Chaque information n'apparaît qu'à un seul endroit",
      "es-ES": "Cada mensaje aparece en un solo lugar",
      "ru-RU": "Одно сообщение показывается только в одном месте",
    },
    lead: [
      {
        "zh-CN": "同一信息在当前视图中只出现一次。有两个位置可放时，放在离相关操作最近的位置；另一位置仅在前者不可见时显示。",
        "zh-TW": "同一資訊在當前檢視中只出現一次。有兩個位置可放時，放在離相關操作最近的位置；另一位置僅在前者不可見時顯示。",
        "en-US": "A piece of information appears once in the current view. When two places on the same screen could hold it, put it next to the related action; the other place shows it only when the first one is not visible.",
        "ja-JP": "一つの情報は、現在の画面に一度だけ表示します。同じ画面で二か所に置けるときは、関連する操作に最も近い方に置き、もう一方は前者が見えないときだけ表示します。",
        "ko-KR": "하나의 정보는 현재 화면에 한 번만 나타난다. 같은 화면에서 두 곳에 둘 수 있으면 관련 조작에 가장 가까운 곳에 두고, 다른 곳은 앞의 것이 보이지 않을 때만 표시한다.",
        "fr-FR": "Une information n'apparaît qu'une fois dans la vue courante. Si deux endroits de l'écran peuvent l'accueillir, on la place près de l'action concernée ; l'autre endroit ne l'affiche que lorsque le premier n'est pas visible.",
        "es-ES": "Una información aparece una sola vez en la vista actual. Si dos lugares de la pantalla pueden mostrarla, se coloca junto a la acción relacionada; el otro solo la muestra cuando el primero no es visible.",
        "ru-RU": "Сообщение показывается в текущем представлении один раз. Если на экране для него есть два места, его ставят рядом с соответствующим действием; второе место показывает его, только когда первое не видно.",
      },
    ],
    examples: [
      zh("训练页第一步的内容区写着「底模仍缺少 2 个文件」，右侧状态栏底部同时写着「底模仍缺少 2 个文件，请先在广场补全资源。」", "停在第一步时只在内容区说明；切到其他步骤，内容区看不到这句时，再由状态栏提示。"),
      zh("同一个提示在内容区和侧栏各放一份", "说明放在离相关操作最近的地方"),
      zh("为了「保险」在多处同时提示", "一处不可见时，再由另一处补上"),
    ],
  },
  {
    "id": "documentStructure",
    "title": {
      "zh-CN": "官网与 README 按用途组织内容，保持紧凑。",
      "zh-TW": "官網與 README 依用途組織內容，保持精簡。",
      "en-US": "Organize websites and READMEs around practical uses and keep them concise.",
      "ja-JP": "公式サイトと README は用途に沿って簡潔に構成します。",
      "ko-KR": "공식 사이트와 README는 실제 용도에 따라 간결하게 구성한다.",
      "fr-FR": "Organiser les sites et les README autour des usages concrets, avec concision.",
      "es-ES": "Organizar los sitios y los README según usos concretos y mantenerlos concisos.",
      "ru-RU": "Строить сайты и README вокруг практических задач и писать кратко."
    },
    "list": [
      {
        "zh-CN": "介绍先说明用户能做什么，再写对应功能与必要步骤。保留具体用途，例如语音聊天、游戏内放歌和同时变声；不用「音频处理」「工作台」等宽泛名称代替。功能说明须与当前实现及发布版本一致。",
        "zh-TW": "介紹先說明使用者能做什麼，再寫對應功能與必要步驟。保留具體用途，例如語音聊天、遊戲內播放音樂和同時變聲；不用「音訊處理」「工作台」等籠統名稱取代。功能說明須與目前實作及發行版本一致。",
        "en-US": "Start with what users can do, then describe the relevant features and necessary steps. Name concrete uses, such as voice chat, in-game music playback and simultaneous voice changing, instead of replacing them with broad labels such as audio processing or workbench. Feature descriptions must match the implementation and release.",
        "ja-JP": "最初に利用者ができることを示し、対応する機能と必要な手順を続けます。ボイスチャット、ゲーム内の音楽再生、同時の音声変換など、具体的な用途を「音声処理」「ワークベンチ」といった広い名称に置き換えません。機能説明は実装と公開版に合わせます。",
        "ko-KR": "먼저 사용자가 할 수 있는 일을 설명하고 관련 기능과 필요한 절차를 이어 쓴다. 음성 채팅, 게임 내 음악 재생, 동시 음성 변환 같은 구체적인 용도를 ‘오디오 처리’나 ‘워크벤치’처럼 포괄적인 이름으로 대체하지 않는다. 기능 설명은 구현 및 배포 버전과 일치해야 한다.",
        "fr-FR": "Présenter d’abord ce que les utilisateurs peuvent faire, puis les fonctions et les étapes nécessaires. Citer les usages concrets, comme le chat vocal, la musique en jeu et le changement de voix simultané, sans les remplacer par des termes généraux comme traitement audio ou atelier. Les descriptions doivent correspondre à l’implémentation et à la version publiée.",
        "es-ES": "Explicar primero qué puede hacer el usuario y después las funciones y los pasos necesarios. Nombrar usos concretos, como el chat de voz, la música en juegos y el cambio de voz simultáneo, sin sustituirlos por términos generales como procesamiento de audio o entorno de trabajo. Las descripciones deben corresponder a la implementación y la versión publicada.",
        "ru-RU": "Сначала объяснять, что может сделать пользователь, затем описывать нужные функции и шаги. Называть конкретные задачи: голосовой чат, музыку в играх и одновременное изменение голоса. Не заменять их общими словами вроде «обработка аудио» или «рабочая среда». Описание функций должно соответствовать реализации и опубликованной версии."
      },
      {
        "zh-CN": "产品介绍和使用说明只写用户可用的功能与操作。分支名、提交记录和实现进度留在开发文档。Beta 功能只有在提供测试版入口并说明使用差异时才进入用户说明，不将开发分支包装成额外的产品功能。",
        "zh-TW": "產品介紹與使用說明只寫使用者可用的功能與操作。分支名稱、提交紀錄和實作進度留在開發文件。Beta 功能只有在提供測試版入口並說明使用差異時才放入使用說明，不將開發分支包裝成額外的產品功能。",
        "en-US": "Product descriptions and user instructions cover available features and actions. Keep branch names, commit records and implementation progress in developer documentation. Mention beta features in user instructions only when a beta download is provided and its usage differences are explained. Do not present a development branch as an additional product feature.",
        "ja-JP": "製品紹介と利用ガイドには、利用できる機能と操作を書きます。ブランチ名、コミット履歴、実装の進捗は開発者向け文書に置きます。ベータ版の機能を利用者向けに説明する場合は、ベータ版の入手先と利用上の違いを示します。開発ブランチそのものを追加機能として紹介しません。",
        "ko-KR": "제품 소개와 사용 설명에는 사용할 수 있는 기능과 조작 방법을 쓴다. 브랜치 이름, 커밋 기록, 구현 진행 상황은 개발 문서에 둔다. 베타 기능은 베타 다운로드 경로와 사용상의 차이를 함께 안내할 때만 사용 설명에 포함한다. 개발 브랜치 자체를 추가 제품 기능으로 소개하지 않는다.",
        "fr-FR": "Les descriptions du produit et les instructions présentent les fonctions et les actions disponibles. Réserver les noms de branches, les commits et l’avancement de l’implémentation à la documentation de développement. Ne présenter les fonctions bêta aux utilisateurs qu’avec un accès à la version bêta et une explication des différences d’utilisation. Une branche de développement n’est pas une fonction supplémentaire du produit.",
        "es-ES": "Las descripciones del producto y las instrucciones explican las funciones y acciones disponibles. Los nombres de ramas, los commits y el progreso de implementación pertenecen a la documentación de desarrollo. Incluir funciones beta en las instrucciones solo si se ofrece acceso a la versión beta y se explican las diferencias de uso. No presentar una rama de desarrollo como una función adicional del producto.",
        "ru-RU": "В описании продукта и инструкциях писать о доступных функциях и действиях. Названия веток, коммиты и ход реализации оставлять в документации для разработчиков. Упоминать бета-функции в пользовательской инструкции только вместе со ссылкой на бета-версию и объяснением отличий в использовании. Не представлять ветку разработки как дополнительную функцию продукта."
      },
      {
        "zh-CN": "同一主题写成完整段落，独立事项才用列表，操作顺序才用编号。不要一句一段、一个链接一段，或为每句说明另设标题。下载、官网、指南等导航集中排列；导航链接可使用分隔符，正文仍按句意组织。",
        "zh-TW": "同一主題寫成完整段落，獨立事項才用清單，操作順序才用編號。不要一句一段、一個連結一段，或為每句說明另設標題。下載、官網、指南等導覽集中排列；導覽連結可使用分隔符號，正文仍依句意組織。",
        "en-US": "Keep one topic in a complete paragraph, use lists for independent items and numbers for ordered steps. Do not give every sentence or link its own paragraph or heading. Group download, website and guide links together. Separators may distinguish navigation links; prose still follows sentence structure.",
        "ja-JP": "同じ話題は一つの段落にまとめ、独立した項目には箇条書き、操作の順序には番号を使います。一文やリンクごとに段落や見出しを設けません。ダウンロード、公式サイト、ガイドへのリンクはまとめて配置します。ナビゲーションのリンクには区切り記号を使えますが、本文は文意に沿って構成します。",
        "ko-KR": "같은 주제는 하나의 완결된 문단으로 쓰고, 독립된 항목에는 목록을, 순서가 있는 절차에는 번호를 사용한다. 문장이나 링크마다 문단이나 제목을 만들지 않는다. 다운로드, 공식 사이트, 안내 링크는 한곳에 모은다. 탐색 링크에는 구분 기호를 사용할 수 있지만 본문은 문장의 의미에 따라 구성한다.",
        "fr-FR": "Regrouper un même sujet dans un paragraphe complet, réserver les listes aux éléments indépendants et les numéros aux étapes ordonnées. Ne pas créer un paragraphe ou un titre pour chaque phrase ou lien. Rassembler les liens de téléchargement, du site et du guide. Les séparateurs peuvent distinguer les liens de navigation ; le texte reste structuré en phrases.",
        "es-ES": "Agrupar un mismo tema en un párrafo completo, usar listas para elementos independientes y números para pasos ordenados. No crear un párrafo o título por cada frase o enlace. Reunir los enlaces de descarga, sitio y guía. Los enlaces de navegación pueden llevar separadores; el texto sigue la estructura de las frases.",
        "ru-RU": "Объединять одну тему в связный абзац, использовать списки для самостоятельных пунктов, а нумерацию для последовательных шагов. Не создавать отдельный абзац или заголовок для каждого предложения и ссылки. Ссылки на загрузку, сайт и руководство размещать вместе. В навигации допустимы разделители; основной текст строится по смыслу предложений."
      },
      {
        "zh-CN": "截图只配必要的简短图注。不要把画面中已有的信息再写成段落，也不要在每张图下重复日期、版本、来源链接和操作指南。日期与版本仅在影响理解时说明；出处与检索信息放在图片元数据或维护记录中。SEO/GEO 不增加读者无须阅读的正文。 同一产品的简短介绍、操作说明与截图集中在产品页，不为检索关键词拆出重复页面。",
        "zh-TW": "截圖只附必要的簡短圖說。不要將畫面中已有的資訊再寫成段落，也不要在每張圖下重複日期、版本、來源連結和操作指南。日期與版本僅在影響理解時說明；出處與檢索資訊放在圖片中繼資料或維護紀錄中。SEO/GEO 不增加讀者無須閱讀的正文。 同一產品的簡短介紹、操作說明與截圖集中於產品頁，不為檢索關鍵字拆出重複頁面。",
        "en-US": "Give screenshots only the short captions they need. Do not restate visible content in paragraphs or repeat dates, versions, source links and instructions under each image. Mention dates and versions only when they affect understanding; keep provenance and search information in image metadata or maintenance records. SEO/GEO must not add prose that readers do not need. Keep a product’s short description, instructions and screenshots on its product page. Do not create duplicate pages for search keywords.",
        "ja-JP": "スクリーンショットには必要な短い説明だけを添えます。画面にある情報を段落で繰り返したり、画像ごとに日付、バージョン、出典リンク、操作ガイドを並べたりしません。日付とバージョンは理解に必要な場合だけ記載し、出典や検索用の情報は画像メタデータや保守記録に置きます。SEO/GEO のために読者に不要な本文を増やしません。 製品の短い紹介、操作説明、スクリーンショットは製品ページにまとめます。検索キーワードのために重複ページを作りません。",
        "ko-KR": "스크린샷에는 필요한 짧은 설명만 붙인다. 화면에 보이는 정보를 문단으로 반복하거나 이미지마다 날짜, 버전, 출처 링크, 사용 안내를 나열하지 않는다. 날짜와 버전은 이해에 영향을 줄 때만 설명하고, 출처 및 검색 정보는 이미지 메타데이터나 유지보수 기록에 둔다. SEO/GEO를 위해 독자에게 불필요한 본문을 늘리지 않는다. 제품의 짧은 소개, 사용 방법, 스크린샷은 제품 페이지에 모은다. 검색 키워드를 위해 중복 페이지를 만들지 않는다.",
        "fr-FR": "Limiter les captures aux légendes courtes nécessaires. Ne pas répéter en paragraphes ce que montre l’image ni ajouter sous chacune dates, versions, liens sources et instructions. Mentionner les dates et versions seulement si elles éclairent le contenu ; conserver la provenance et les informations de recherche dans les métadonnées ou les notes de maintenance. Le SEO/GEO ne doit pas ajouter de texte inutile aux lecteurs. Regrouper la courte présentation, les instructions et les captures sur la page du produit. Ne pas créer de pages redondantes pour des mots-clés de recherche.",
        "es-ES": "Añadir a las capturas solo las leyendas breves necesarias. No repetir en párrafos lo que ya muestra la imagen ni añadir bajo cada una fechas, versiones, enlaces de origen e instrucciones. Mencionar fechas y versiones solo cuando ayuden a comprender; guardar la procedencia y los datos de búsqueda en metadatos o registros de mantenimiento. El SEO/GEO no debe añadir texto que el lector no necesita. Reunir la descripción breve, las instrucciones y las capturas en la página del producto. No crear páginas duplicadas para palabras clave de búsqueda.",
        "ru-RU": "Добавлять к снимкам экрана только необходимые короткие подписи. Не пересказывать видимое на изображении отдельными абзацами и не повторять под каждым снимком дату, версию, ссылки на источник и инструкции. Указывать дату и версию только тогда, когда они важны для понимания; сведения об источнике и поиске хранить в метаданных или записях сопровождения. SEO/GEO не должно добавлять ненужный читателю текст. Краткое описание, инструкции и снимки экрана размещать на странице продукта. Не создавать дублирующие страницы ради поисковых запросов."
      }
    ],
    "examples": [
      {
        "source": "RVC Fabric README",
        "pairs": {
          "zh-CN": [
            "官方截图。\n\n截图记录于 2026 年 8 月。\n\n官网。\n\n使用指南。\n\n下载 Windows 版。",
            "图片后集中放置下载、官网与使用指南链接，删除无须单独说明的截图日期。"
          ]
        }
      },
      {
        "source": "RVC Fabric 产品介绍",
        "pairs": {
          "zh-CN": [
            "Windows 实时 AI 语音转换与模型训练工作台。",
            "可在 QQ、Discord 和游戏语音中实时变声、播放音乐和音效。"
          ]
        }
      },
      {
        "source": "RVC Fabric README",
        "pairs": {
          "zh-CN": [
            "Neptune 海王星开发分支还提供手机配对、本地 API 和 MCP 接口。",
            "用户介绍删除这段分支说明，Beta 实现进度留在开发文档。"
          ]
        }
      }
    ]
  },
  {
    id: "marketing",
    title: {
      "zh-CN": "营销口号与破折号句式",
      "zh-TW": "營銷口號與破折號句式",
      "en-US": "Marketing slogans and dash-joined sentences",
      "ja-JP": "宣伝文句とダッシュでつないだ文",
      "ko-KR": "광고 문구와 줄표로 이은 문장",
      "fr-FR": "Slogans publicitaires et phrases reliées par des tirets",
      "es-ES": "Eslóganes publicitarios y frases unidas con guiones",
      "ru-RU": "Рекламные лозунги и фразы через тире",
    },
    examples: [
      zh("游戏开黑、语音连麦、直播互动、音频制作——低延迟、高还原的实时处理，一个软件全搞定。", "用于语音聊天、游戏语音和直播的实时桌面工具。"),
      zh("一键完成全部流程：……全流程可视化向导，小白也能轻松搞定", "向导式流程：在界面内依次完成预处理、参数设置与结果导出。"),
      zh("温暖的奶油纸张底色、克制的珊瑚赤陶强调色、清晰的层级边界——为桌面工具打造的一体化前端底盘。", "桌面工具共用的前端基础库与设计系统，包含统一配色、组件与窗口框架。"),
      zh("卡片之间留白充足，悬浮态只做极轻微的上浮与阴影加深，拒绝廉价霓虹发光。", "卡片之间保留间距，悬停时仅做轻微位移与阴影加深，不加霓虹发光等强效装饰。"),
      zh("竖图在卡片里只显示中段 —— 这就是要裁的原因", "纵向图片在卡片中仅展示中间区域，可通过裁剪调整显示范围"),
    ],
  },
  {
    id: "metaphor",
    title: {
      "zh-CN": "比喻与网络用语",
      "zh-TW": "比喻與網路用語",
      "en-US": "Metaphors and internet slang",
      "ja-JP": "比喩とネットスラング",
      "ko-KR": "비유와 인터넷 은어",
      "fr-FR": "Métaphores et argot d'internet",
      "es-ES": "Metáforas y jerga de internet",
      "ru-RU": "Метафоры и интернет-сленг",
    },
    examples: [
      zh("防止模型卡在同一口气里反复嘟囔（复读机）的手刹。如果发现无限循环，把它稍微调高一点。", "防止模型重复输出同一段内容。如果结果里反复出现同一句话，可适当调高。"),
      zh("每一步只从最有可能的前 K 个候选项里挑。调小更稳但像背课文；调大更灵动但容易胡言乱语。", "每步只在概率最高的前 K 个候选中采样。调小更稳定，调大变化更多，过高容易出错。"),
      zh("控制随机性的「活跃度旋钮」。低了平淡守规矩，高了起伏大但容易翻车。", "控制采样的随机程度。数值较低时输出更稳，调高后变化更多，但过高容易失真。"),
      zh("负责决定整体节奏怎么走——相当于给流程做「总导演」。", "控制整体处理节奏与任务调度。"),
      zh("把别人家的配置复制进来（连同关联索引一并复制）。", "导入外部配置文件（将同时复制关联的索引文件）。"),
      zh("中频滤波加轻微过载与颤音，沙沙声和过载都在，人话还在", "中频滤波叠加轻微过载与颤音，模拟老式收音机效果。"),
      zh("刚说过的话倒着渗回来，阴湿", "将混响尾音倒放并叠加轻微音高偏移，产生反向回声效果。"),
    ],
  },
  {
    id: "casual",
    title: {
      "zh-CN": "口语与不完整的句子",
      "zh-TW": "口語與不完整的句子",
      "en-US": "Casual speech and incomplete sentences",
      "ja-JP": "話し言葉と不完全な文",
      "ko-KR": "구어체와 불완전한 문장",
      "fr-FR": "Langage familier et phrases incomplètes",
      "es-ES": "Lenguaje coloquial y frases incompletas",
      "ru-RU": "Разговорная речь и незаконченные фразы",
    },
    examples: [
      {
        source: "RVC Fabric (s.trainInterrupted)",
        pairs: {
          "zh-CN": ["上次训练（{v0}）在第 {v1} / {v2} 轮中断了。切片和特征都还在，直接开始训练会自动接着跑，不用重新处理素材。", "上次训练（{v0}）在第 {v1} / {v2} 轮中断。切片和特征仍然保留，直接开始训练即可从中断处继续，无需重新处理素材。"],
          "zh-TW": ["上次訓練（{v0}）在第 {v1} / {v2} 輪中斷了。切片和特徵都還在，直接開始訓練會自動接著跑，不用重新處理素材。", "上次訓練（{v0}）在第 {v1} / {v2} 輪中斷。切片和特徵仍然保留，直接開始訓練即可從中斷處繼續，無需重新處理素材。"],
          "en-US": ["The last run ({v0}) stopped at epoch {v1} of {v2}. Slices and features are still on disk — starting again picks up where it left off, no need to reprocess.", "The last training run ({v0}) stopped at epoch {v1} of {v2}. Slices and features are still on disk. Start training again to continue from that point without reprocessing the material."],
          "ja-JP": ["前回の学習（{v0}）は {v2} 回中 {v1} 回目で中断されました。スライスと特徴はディスクに残っているので、そのまま開始すれば続きから走ります。素材の再処理は不要です。", "前回の学習（{v0}）は {v2} 回中 {v1} 回目で中断されました。スライスと特徴はディスクに残っているため、そのまま開始すれば中断した箇所から再開します。素材の再処理は不要です。"],
          "fr-FR": ["Le dernier entraînement ({v0}) s'est arrêté à l'époque {v1} sur {v2}. Les segments et les caractéristiques sont toujours là : relancer reprend où ça s'était arrêté, sans retraiter.", "Le dernier entraînement ({v0}) s'est arrêté à l'époque {v1} sur {v2}. Les segments et les caractéristiques sont toujours sur le disque. Relancez l'entraînement pour reprendre à cet endroit, sans retraiter le matériau."],
          "ru-RU": ["Прошлое обучение ({v0}) прервалось на эпохе {v1} из {v2}. Нарезка и признаки остались на диске — запуск продолжит с того же места, повторная обработка не нужна.", "Прошлое обучение ({v0}) прервалось на эпохе {v1} из {v2}. Нарезка и признаки остались на диске. Запустите обучение снова, чтобы продолжить с того же места без повторной обработки материала."],
        },
      },
      zh("越短延迟越低，但越吃 GPU/CPU", "数值越小延迟越低，但显卡与处理器占用越高"),
      zh("每一步同时塞几条数据进显卡。显存够就调大一点，爆显存就往小调。", "每步同时处理的样本数量。显存充足可调大，显存不足时调小。"),
      zh("装了多块 N 卡时在这选跑哪一块；序号靠前的不一定是最快的，认准显卡型号选", "有多张 NVIDIA 显卡时可在此指定计算卡；序号不代表性能，请按型号选择。"),
      zh("换页和磨砂会略微掉帧，只有界面闪退或花屏时才需要开", "关闭背景模糊与过渡动画，仅在界面闪烁或花屏时开启。"),
      zh("启动时就把常用模型载入显卡，点开始不用等加载", "启动时预先加载常用模型到显存，减少首次运行等待。"),
      zh("处理后的声音和背景音会混在一起，从这个设备出去", "处理后的人声会与背景音混合后从该设备输出。"),
      zh("把处理后的声音再放一份给你听", "将处理后的音频同步输出至监听设备"),
      zh("对着麦克风说几句话，看看音量条动不动", "对着麦克风说话，确认音量条有反应。"),
      zh("选完再拖下面的推子微调", "选择预设后，可通过下方滑块微调参数"),
      zh("包里是最近日志、配置快照与环境信息，用户目录名会被抹掉。", "诊断包包含近期日志、配置快照与环境信息，会自动隐去个人目录名。"),
      zh("彻底清空所有数据（包括自己导入或创建的项目，删了找不回来）", "彻底清除所有数据（包括已导入和本地创建的项目，删除后无法恢复）"),
      zh("去下载 / 去补全运行时 / 去调参数", "前往下载 / 配置运行环境 / 调整参数"),
    ],
  },
  {
    id: "defensive",
    title: {
      "zh-CN": "防御性说明与说教",
      "zh-TW": "防禦性說明與說教",
      "en-US": "Defensive explanations and lecturing",
      "ja-JP": "防御的な説明と説教",
      "ko-KR": "방어적인 설명과 훈계",
      "fr-FR": "Explications défensives et ton moralisateur",
      "es-ES": "Explicaciones defensivas y tono aleccionador",
      "ru-RU": "Оправдания и назидательный тон",
    },
    examples: [
      zh("首次加载模型到显卡要十几秒，不是软件卡死", "首次加载模型到显存约需十几秒，请稍候。"),
      zh("出了问题先点右上角导出「诊断包」，连同复现步骤一起发出来，比只截一张报错图管用得多。", "反馈问题时请点击右上角导出「诊断包」，并附上复现步骤。"),
      zh("破坏性操作必须二次确认，按钮文案直接写出具体动词，不要只写「确定」。", "不可逆操作需二次确认，确认按钮应写明具体动作。"),
      zh("长文本一定要选切分方式，不然一口气处理太长必崩。", "输入长文本时请选择切分方式；单次处理过长文本可能导致执行失败。"),
      zh("还有没保存的修改，确定直接丢掉吗？", "当前存在未保存的修改，确定要放弃这些更改吗？"),
      zh("高级功能，一般不用", "高级选项，通常保持默认即可"),
    ],
  },
  {
    id: "jargon",
    title: {
      "zh-CN": "开发用语与中英混用",
      "zh-TW": "開發用語與中英混用",
      "en-US": "Developer jargon and mixed languages",
      "ja-JP": "開発用語と言語の混在",
      "ko-KR": "개발 용어와 언어 혼용",
      "fr-FR": "Jargon de développeur et mélange de langues",
      "es-ES": "Jerga de desarrollo y mezcla de idiomas",
      "ru-RU": "Жаргон разработчиков и смешение языков",
    },
    examples: [
      {
        source: "RVC Fabric (s.fd40e2e936)",
        pairs: {
          "zh-CN": ["找不到实时 worker: {a0}", "找不到实时变声引擎文件：{a0}"],
          "zh-TW": ["找不到即時 worker: {a0}", "找不到即時變聲引擎檔案：{a0}"],
          "en-US": ["Cannot find realtime worker: {a0}", "Cannot find the realtime engine file: {a0}"],
          "ja-JP": ["リアルタイム worker が見つかりません: {a0}", "リアルタイム変声エンジンのファイルが見つかりません：{a0}"],
          "ko-KR": ["실시간 worker를 찾을 수 없음: {a0}", "실시간 변성 엔진 파일을 찾을 수 없습니다: {a0}"],
          "fr-FR": ["Worker en temps réel introuvable : {a0}", "Fichier du moteur en temps réel introuvable : {a0}"],
          "es-ES": ["No se encuentra el worker en tiempo real: {a0}", "No se encuentra el archivo del motor en tiempo real: {a0}"],
          "ru-RU": ["worker реального времени не найден: {a0}", "Не найден файл движка реального времени: {a0}"],
        },
      },
      {
        source: "RVC Fabric (s.stsRecordNeedRuntime)",
        pairs: {
          "zh-CN": ["录音需要 Runtime，请先完成首次补全。", "录音需要运行环境，请先完成首次补全。"],
          "zh-TW": ["錄音需要 Runtime，請先完成首次補全。", "錄音需要執行環境，請先完成首次補全。"],
          "en-US": ["Recording needs Runtime. Finish first-run setup first.", "Recording needs the runtime environment. Finish first-run setup first."],
          "ja-JP": ["録音には Runtime が必要です。先に初回セットアップを完了してください。", "録音には実行環境が必要です。先に初回の補完を完了してください。"],
          "ko-KR": ["녹음에는 Runtime이 필요합니다. 먼저 초기 설정을 마치세요.", "녹음에는 실행 환경이 필요합니다. 먼저 초기 보완을 마치십시오."],
          "fr-FR": ["L’enregistrement nécessite Runtime. Terminez d’abord la configuration initiale.", "L’enregistrement nécessite l’environnement d’exécution. Terminez d’abord la configuration initiale."],
          "es-ES": ["La grabación necesita Runtime. Termina primero la configuración inicial.", "La grabación necesita el entorno de ejecución. Termine primero la configuración inicial."],
          "ru-RU": ["Для записи нужен Runtime. Сначала завершите первоначальную настройку.", "Для записи нужна среда выполнения. Сначала завершите первоначальную настройку."],
        },
      },
      {
        source: "GPT-SoVITS Fabric (s.6462f5c407)",
        pairs: {
          "zh-CN": ["找不到可替换的 frontend 目录，本次安装无法热更界面", "找不到可替换的界面文件夹，本次安装无法在线更新界面"],
          "zh-TW": ["找不到可替換的 frontend 目錄，本次安裝無法熱更介面", "找不到可替換的介面資料夾，本次安裝無法線上更新介面"],
          "en-US": ["No replaceable frontend folder — UI hot-update isn't possible this install", "No replaceable interface folder was found, so this installation cannot update the interface online"],
          "ja-JP": ["置き換え可能な frontend ディレクトリが見つからないため、今回のインストールでは UI をホット更新できません", "置き換え可能なインターフェースのフォルダーが見つからないため、今回のインストールではインターフェースをオンライン更新できません"],
          "ko-KR": ["교체할 frontend 디렉토리를 찾을 수 없어 이번 설치에서는 UI 핫 업데이트가 불가합니다", "교체할 수 있는 인터페이스 폴더를 찾을 수 없어 이번 설치에서는 인터페이스를 온라인으로 업데이트할 수 없습니다"],
          "fr-FR": ["Aucun dossier frontend remplaçable : la mise à jour à chaud de l'interface est impossible pour cette installation", "Aucun dossier d'interface remplaçable n'a été trouvé ; cette installation ne peut pas mettre à jour l'interface en ligne"],
          "es-ES": ["No hay carpeta frontend reemplazable; esta instalación no puede actualizar la interfaz en caliente", "No se encontró una carpeta de interfaz reemplazable; esta instalación no puede actualizar la interfaz en línea"],
          "ru-RU": ["Не найдена заменяемая папка frontend — горячее обновление интерфейса при этой установке невозможно", "Не найдена заменяемая папка интерфейса, поэтому при этой установке обновить интерфейс онлайн нельзя"],
        },
      },
      zh("界面 render 崩溃：{msg}", "界面渲染异常：{msg}"),
      zh("worker 未运行", "后台服务未运行"),
      zh("download: {msg} / connecting: {msg} / download: 校验失败", "下载失败：{msg} / 正在连接：{msg} / 下载文件校验失败"),
      zh("落地路径：{path} / 落地失败：{msg}", "保存路径：{path} / 文件保存失败：{msg}"),
      zh("无法拉清单：{msg} / 无法热更界面：{msg}", "无法获取组件列表：{msg} / 无法动态更新界面：{msg}"),
      zh("令牌 / 设计令牌（Design Tokens）", "设计规范 / 设计规范（Design Tokens）"),
      zh("清理数据集中间件（切分片段与特征缓存）", "清理数据集临时文件（切分片段与特征缓存）"),
    ],
  },
  {
    id: "warmth",
    title: {
      "zh-CN": "需要亲切处写成公文",
      "zh-TW": "需要親切處寫成公文",
      "en-US": "Official tone where warmth is intended",
      "ja-JP": "親しみが必要な所を公文書調にする",
      "ko-KR": "친근해야 할 곳을 공문체로 쓰기",
      "fr-FR": "Ton administratif là où la chaleur est voulue",
      "es-ES": "Tono oficial donde se busca cercanía",
      "ru-RU": "Официальный тон там, где нужна теплота",
    },
    examples: [
      zh("您已完成 10 次语音合成。本软件完全免费。如果它对您有帮助，欢迎关注开发团队的账号，获取更新与支持。本提示仅显示一次。", "不知不觉你已经合成 10 次语音啦！本软件完全免费，如果觉得好用的话，欢迎关注我们的账号支持我们~（本提示只会出现一次）"),
      zh("关注官方账号以获取更多信息", "觉得软件好用吗？关注我们吧~"),
      zh("查看使用说明文档", "不会用？转至说明页"),
    ],
  },
  {
    id: "translation",
    title: {
      "zh-CN": "多语言直译错误",
      "zh-TW": "多語言直譯錯誤",
      "en-US": "Literal translation errors",
      "ja-JP": "直訳による誤り",
      "ko-KR": "직역 오류",
      "fr-FR": "Erreurs de traduction littérale",
      "es-ES": "Errores de traducción literal",
      "ru-RU": "Ошибки дословного перевода",
    },
    examples: [
      {
        source: "RVC Fabric (s.inferGuideA2)",
        pairs: {
          "ja-JP": ["元と同じです。rmvpe が無難。オフラインに fcpe は無いので一覧にも出しません。", "rmvpe が最も良い結果になります。harvest は低音が安定しますが遅く、pm は速いものの音が裏返りやすく、crepe は結果が良いものの GPU メモリを多く使います。オフライン変換は fcpe に対応していないため、一覧には表示されません。"],
          "ko-KR": ["원판과 같습니다. 오프라인에는 fcpe가 없어 목록에도 없습니다.", "rmvpe가 가장 좋은 결과를 냅니다. harvest는 저음이 안정적이지만 느리고, pm은 빠르지만 음이 갈라지기 쉬우며, crepe는 결과가 좋지만 그래픽 메모리를 더 많이 사용합니다. 오프라인 변환은 fcpe를 지원하지 않으므로 목록에 표시되지 않습니다."],
          "fr-FR": ["Comme l'original. Pas de fcpe hors ligne, donc pas dans la liste.", "rmvpe donne les meilleurs résultats. harvest est stable dans les graves mais lent. pm est rapide mais peut casser la voix. crepe donne de bons résultats mais utilise davantage de mémoire graphique. La conversion hors ligne ne prend pas en charge fcpe ; il n'apparaît donc pas dans la liste."],
          "es-ES": ["Igual que el original. Fuera de línea no hay fcpe, así que no aparece.", "rmvpe da los mejores resultados. harvest es estable en graves pero lento. pm es rápido pero puede quebrar la voz. crepe da buenos resultados pero usa más memoria gráfica. La conversión sin conexión no admite fcpe, por eso no aparece en la lista."],
          "ru-RU": ["Как в оригинале. Офлайн без fcpe, поэтому его нет в списке.", "rmvpe даёт лучший результат. harvest стабилен на низких нотах, но медленный. pm быстрый, но голос может срываться. crepe даёт хороший результат, но использует больше видеопамяти. Офлайн-преобразование не поддерживает fcpe, поэтому его нет в списке."],
        },
      },
      zh("英 warehouse / 韩 창고 / 俄 склад", "英 repository / 繁 本儲存庫 / 日 本リポジトリ / 韩 본 저장소 / 法 ce dépôt / 西 este repositorio / 俄 этот репозиторий", "本仓库（Git）"),
      zh("英 anti-shake / 繁 防手震 / 日 手ブレ補正 / 韩 흔들림 방지", "英 debounce / 繁 防抖（debounce） / 日 デバウンス / 韩 디바운스 / 法 anti-rebond (debounce) / 西 antirrebote / 俄 дебаунс", "内置防抖"),
      zh("英 fillet / 韩 모깎기 / 西 filete / 俄 фаска", "英 border-radius / 繁 圓角 / 日 角丸 / 韩 모서리 반경 / 法 rayons de bordure / 西 bordes redondeados / 俄 скругление углов", "五档圆角"),
      zh("英 desensitized / 日 脱感作 / 法 désensibilisés", "英 redacted / 繁 去識別化 / 日 マスキング / 韩 비식별화 / 法 anonymisés / 西 anonimizan / 俄 обезличиваются", "路径自动脱敏"),
      zh("西 cosecha（收割庄稼） / 法 crêpe（可丽饼） / 日 クレープ", "原样保留专有名词 harvest、crepe", "harvest / crepe"),
      zh("英 sound card / 日 サウンドカード / 俄 звуковая карта", "英 voice card / 繁 音色卡片 / 日 ボイスカード / 韩 음색 카드 / 法 carte de voix / 西 tarjeta de voz / 俄 карточка голоса", "音色卡片"),
      zh("英 zero-sample / few-sample", "英 zero-shot / few-shot / 日 ゼロショット / フューショット / 韩 제로샷 / 퓨샷", "零样本 / 少样本"),
    ],
  },
];
