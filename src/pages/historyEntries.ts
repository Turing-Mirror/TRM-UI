import type { Text } from "./rules";

/**
 * 已被取代的成熟设计。「历史」页照这份数据渲染，按日期从新到旧排。
 *
 * 只收曾经正式用过、后来被换掉的设计；没上线过的尝试不收。
 * date 是被取代的那一天。新增一条时八种语言写全。
 */
export type HistoryEntry = {
  id: string;
  date: string;
  /** 被取代的设计。 */
  old: Text;
  /** 取代它的设计。 */
  now: Text;
  /** 为什么换。 */
  why: Text;
};

export const HISTORY: HistoryEntry[] = [
{
  "id": "page-keep-and-warm",
  "date": "2026-11-12",
  "old": {
    "zh-CN": "离开一页就整页卸下，再来时重新搭建，输入、筛选和滚动位置都不留；第一次进入内容多的页，推移开头会停顿一下。",
    "zh-TW": "離開一頁就整頁卸下，再來時重新搭建，輸入、篩選和捲動位置都不留；第一次進入內容多的頁，推移開頭會停頓一下。",
    "en-US": "Leaving a page unmounted it; coming back rebuilt it, losing input, filters and scroll position. The first visit to a heavy page stalled at the start of the slide.",
    "ja-JP": "ページを離れると丸ごと外され、戻ると作り直されて、入力・絞り込み・スクロール位置が消えていた。重いページに初めて入ると、スライドの出だしが一瞬止まっていた。",
    "ko-KR": "페이지를 떠나면 통째로 내려가고 돌아오면 다시 만들어져 입력, 필터, 스크롤 위치가 사라졌다. 내용이 많은 페이지에 처음 들어가면 이동이 시작될 때 잠깐 멈췄다.",
    "fr-FR": "Quitter une page la démontait ; y revenir la reconstruisait, sans la saisie, les filtres ni la position de défilement. La première visite d’une page lourde marquait un arrêt au début du glissement.",
    "es-ES": "Al salir de una página se desmontaba; al volver se reconstruía y se perdían lo escrito, los filtros y la posición de desplazamiento. La primera visita a una página pesada se detenía al empezar el desplazamiento.",
    "ru-RU": "При уходе страница снималась целиком, при возврате собиралась заново: ввод, фильтры и положение прокрутки терялись. Первый вход на тяжёлую страницу давал заминку в начале сдвига."
  },
  "now": {
    "zh-CN": "页面可以常驻：离开后状态留着，副作用停掉，回来时重新执行，数据照样刷新。空闲时提前搭好其余的页。",
    "zh-TW": "頁面可以常駐：離開後狀態留著，副作用停掉，回來時重新執行，資料照樣重新整理。閒置時提前搭好其餘的頁。",
    "en-US": "Pages can stay: state is kept after leaving, effects stop and run again on return, so data still refreshes. The other pages are built ahead while idle.",
    "ja-JP": "ページを常駐にできる。離れても状態は残り、副作用は止まって戻ったときに再実行されるので、データは更新される。残りのページはアイドル時に先に組み立てる。",
    "ko-KR": "페이지를 상주시킬 수 있다. 떠난 뒤에도 상태는 남고, 부수 효과는 멈췄다가 돌아오면 다시 실행되어 데이터가 새로 고쳐진다. 나머지 페이지는 한가할 때 미리 만든다.",
    "fr-FR": "Les pages peuvent rester en place : l’état est conservé, les effets s’arrêtent puis reprennent au retour, les données se rafraîchissent donc. Les autres pages sont construites à l’avance pendant les temps morts.",
    "es-ES": "Las páginas pueden permanecer: el estado se conserva, los efectos se detienen y se repiten al volver, así que los datos se actualizan. Las demás páginas se construyen por adelantado en los ratos libres.",
    "ru-RU": "Страницы могут оставаться: состояние сохраняется, эффекты останавливаются и выполняются снова при возврате, поэтому данные обновляются. Остальные страницы собираются заранее в простое."
  },
  "why": {
    "zh-CN": "重新搭建既丢状态又占用推移的第一帧。只停副作用不拆界面，两个问题一起解决，后台也不多耗资源。",
    "zh-TW": "重新搭建既丟狀態又佔用推移的第一幀。只停副作用不拆介面，兩個問題一起解決，背景也不多耗資源。",
    "en-US": "Rebuilding lost state and took the first frame of the slide. Stopping effects while keeping the interface solves both without extra background work.",
    "ja-JP": "作り直しは状態を失い、スライドの最初のフレームも奪っていた。副作用だけ止めて画面を残せば両方が解決し、裏での負荷も増えない。",
    "ko-KR": "다시 만들면 상태를 잃고 이동의 첫 프레임도 빼앗긴다. 화면은 두고 부수 효과만 멈추면 두 문제가 함께 풀리고 백그라운드 부담도 늘지 않는다.",
    "fr-FR": "Reconstruire faisait perdre l’état et occupait la première image du glissement. Arrêter les effets en gardant l’interface règle les deux sans travail d’arrière-plan supplémentaire.",
    "es-ES": "Reconstruir perdía el estado y ocupaba el primer fotograma del desplazamiento. Detener los efectos conservando la interfaz resuelve ambas cosas sin trabajo adicional en segundo plano.",
    "ru-RU": "Пересборка теряла состояние и занимала первый кадр сдвига. Остановка эффектов при сохранённом интерфейсе решает обе проблемы без лишней фоновой работы."
  }
},
{
  "id": "page-crossfade-and-thumb-wait",
  "date": "2026-11-11",
  "old": {
    "zh-CN": "换页时新旧两页叠在一起淡入淡出，只移动很小一段；点击分段滑块后，滑块到达目标项上方才切换内容。",
    "zh-TW": "換頁時新舊兩頁疊在一起淡入淡出，只移動很小一段；點擊分段滑塊後，滑塊到達目標項上方才切換內容。",
    "en-US": "On a page change both pages cross-faded on top of each other with only a small move; after a click on the segment control, content switched only when the thumb arrived.",
    "ja-JP": "ページ切り替えでは新旧 2 ページが重なってフェードし、わずかにしか動かなかった。セグメントをクリックすると、つまみが到着してから内容が切り替わっていた。",
    "ko-KR": "페이지를 바꿀 때 두 페이지가 겹친 채 나타나고 사라지며 조금만 움직였다. 세그먼트를 클릭하면 슬라이더가 도착한 뒤에 내용이 바뀌었다.",
    "fr-FR": "Les deux pages se fondaient l’une sur l’autre avec un très court déplacement ; après un clic sur le sélecteur, le contenu ne changeait qu’à l’arrivée du curseur.",
    "es-ES": "Las dos páginas se fundían una sobre otra con un desplazamiento mínimo; tras un clic en el selector, el contenido cambiaba solo cuando llegaba el deslizador.",
    "ru-RU": "При смене страницы обе страницы растворялись друг поверх друга с небольшим сдвигом; после щелчка по переключателю содержимое менялось только по прибытии ползунка."
  },
  "now": {
    "zh-CN": "点击当帧开始。新旧两页首尾相接整页推移，全程不透明；中途再点，从当前位置接着走。",
    "zh-TW": "點擊當幀開始。新舊兩頁首尾相接整頁推移，全程不透明；中途再點，從目前位置接著走。",
    "en-US": "Motion starts in the frame of the click. The old and new pages move edge to edge as whole pages, fully opaque; a click midway continues from the current position.",
    "ja-JP": "クリックと同じフレームで始まる。新旧 2 ページは端と端を接してページごと動き、不透明のまま。途中でクリックすると現在位置から続く。",
    "ko-KR": "클릭한 프레임에 시작한다. 이전 페이지와 새 페이지가 맞닿은 채 통째로 움직이며 투명도는 바뀌지 않는다. 도중에 클릭하면 현재 위치에서 이어진다.",
    "fr-FR": "Le mouvement commence dans l’image du clic. L’ancienne et la nouvelle page se déplacent bord à bord, entières et opaques ; un clic en cours de route continue depuis la position actuelle.",
    "es-ES": "El movimiento empieza en el fotograma del clic. La página anterior y la nueva se desplazan enteras, borde con borde y opacas; un clic a mitad continúa desde la posición actual.",
    "ru-RU": "Движение начинается в кадре щелчка. Старая и новая страницы сдвигаются целиком, вплотную и непрозрачно; щелчок по ходу продолжает движение с текущего положения."
  },
  "why": {
    "zh-CN": "点击后要空等约 0.1 秒，换页中途两页文字叠在一起，连点时动画从头重放。",
    "zh-TW": "點擊後要空等約 0.1 秒，換頁中途兩頁文字疊在一起，連點時動畫從頭重播。",
    "en-US": "A click was followed by about 0.1s of waiting, the text of two pages overlapped midway, and repeated clicks restarted the animation.",
    "ja-JP": "クリック後に約 0.1 秒の待ちがあり、途中で 2 ページの文字が重なり、連続クリックでアニメーションが最初からやり直されていた。",
    "ko-KR": "클릭 뒤 약 0.1초를 기다려야 했고, 도중에 두 페이지의 글자가 겹쳤으며, 연속 클릭하면 애니메이션이 처음부터 다시 재생됐다.",
    "fr-FR": "Un clic était suivi d’environ 0,1s d’attente, les textes des deux pages se superposaient, et des clics répétés relançaient l’animation.",
    "es-ES": "Tras un clic había que esperar unos 0,1s, el texto de las dos páginas se superponía y los clics repetidos reiniciaban la animación.",
    "ru-RU": "После щелчка приходилось ждать около 0,1s, текст двух страниц накладывался, а повторные щелчки запускали анимацию заново."
  }
},
{
  "id": "workbench-paged-navigation",
  "date": "2026-11-07",
  "old": {
    "zh-CN": "工作台筛选起点比标题更靠左；审核正文仍逐块伸缩，只有聊天整层推移；队列通过加载更多追加。",
    "zh-TW": "工作台篩選起點比標題更靠左；審核正文仍逐塊伸縮，只有聊天整層推移；佇列透過載入更多追加。",
    "en-US": "Workbench filters began left of the title; reviews still expanded blocks while only chats pushed whole bodies, and queues used load more.",
    "ja-JP": "フィルターが見出しより左に寄り、レビュー本文はブロック別に開閉し、会話だけ全体を押していた。キューは追加読み込みだった。",
    "ko-KR": "필터가 제목보다 왼쪽에 있었고 검토 본문은 블록별로 펼쳐지며 채팅만 전체를 밀었다. 대기열은 더 보기로 추가했다.",
    "fr-FR": "Les filtres dépassaient le titre à gauche ; les avis déployaient des blocs, seuls les chats poussaient le corps entier ; les files chargeaient davantage.",
    "es-ES": "Los filtros empezaban a la izquierda del título; las revisiones expandían bloques, solo los chats empujaban todo el cuerpo y las colas cargaban más filas.",
    "ru-RU": "Фильтры начинались левее заголовка; проверки раскрывали блоки, только чаты сдвигали всё тело, а очереди использовали дозагрузку."
  },
  "now": {
    "zh-CN": "列表头与行共用内容左边缘；所有详情只按列表顺序推移整层正文；Pager 固定在列表卡片底部，换页水平推移并回到顶部。",
    "zh-TW": "清單標頭與列共用內容左邊緣；所有詳情只按清單順序推移整層正文；Pager 固定在清單卡片底部，換頁水平推移並回到頂部。",
    "en-US": "List heads and rows share one content edge. Every detail pushes only the whole body in list order. Pager stays at the card foot; pages push horizontally and reset scroll.",
    "ja-JP": "一覧の見出しと行の左端を揃え、すべての詳細で本文全体だけを一覧順に押す。Pager はカード下部に固定し、ページは水平移動して先頭へ戻る。",
    "ko-KR": "목록 머리와 행의 왼쪽을 맞추고 모든 상세에서 본문 전체만 목록 순서대로 민다. Pager는 카드 하단에 고정하며 페이지는 가로로 이동하고 맨 위로 돌아간다.",
    "fr-FR": "En-têtes et lignes partagent le même bord. Tous les détails poussent uniquement le corps entier selon la liste. Pager reste au pied de la carte ; les pages glissent horizontalement et remontent en haut.",
    "es-ES": "Cabeceras y filas comparten el borde. Todos los detalles empujan solo el cuerpo completo según la lista. Pager queda al pie; las páginas se deslizan horizontalmente y vuelven arriba.",
    "ru-RU": "Заголовки и строки имеют общий край. Все детали сдвигают только всё тело по порядку списка. Pager закреплён внизу карточки; страницы движутся горизонтально и возвращаются вверх."
  },
  "why": {
    "zh-CN": "需要统一对齐、简化详情切换，并用页码替代工作队列的无限追加。",
    "zh-TW": "需要統一對齊、簡化詳情切換，並用頁碼取代工作佇列的無限追加。",
    "en-US": "Alignment had to be unified, detail switches simplified, and endless work queues replaced with numbered pages.",
    "ja-JP": "整列の統一、詳細切替の簡素化、作業キューの無限追加からページ番号への変更が必要になったため。",
    "ko-KR": "정렬 통일, 상세 전환 단순화, 작업 대기열의 무한 추가를 페이지 번호로 바꾸어야 했기 때문이다.",
    "fr-FR": "Il fallait unifier l'alignement, simplifier les transitions de détail et remplacer les files infinies par des pages numérotées.",
    "es-ES": "Era necesario unificar la alineación, simplificar los cambios de detalle y sustituir las colas infinitas por páginas numeradas.",
    "ru-RU": "Требовалось унифицировать выравнивание, упростить смену деталей и заменить бесконечные очереди номерами страниц."
  }
},
{
  "id": "chat-composer-outside",
  "date": "2026-11-07",
  "old": {
    "zh-CN": "第 7 轮在聊天输入区域内放置 32px 发送按钮，状态栏内容左对齐，忙碌图标立即出现。",
    "zh-TW": "第 7 輪在聊天輸入區域內放置 32px 傳送按鈕，狀態列內容靠左，忙碌圖示立即出現。",
    "en-US": "Round 7 placed a 32px send button inside the field, aligned the state left and showed busy glyphs immediately.",
    "ja-JP": "第7回では32pxの送信ボタンを入力欄に内蔵し、状態を左寄せし、待機表示を即時に出していた。",
    "ko-KR": "7차에서는 32px 전송 버튼을 입력창 안에 두고 상태를 왼쪽에 정렬하며 진행 표시를 즉시 보여 주었다.",
    "fr-FR": "Le tour 7 plaçait un bouton de 32px dans le champ, alignait l’état à gauche et affichait immédiatement l’indicateur d’attente.",
    "es-ES": "La ronda 7 colocaba un botón de 32px dentro del campo, alineaba el estado a la izquierda y mostraba el progreso inmediatamente.",
    "ru-RU": "Раунд 7 помещал кнопку 32px внутрь поля, выравнивал состояние слева и сразу показывал индикатор ожидания."
  },
  "now": {
    "zh-CN": "发送按钮移到输入区域外侧右边，等于单行区域的 48px 高度，底部对齐、间距 8px。状态居中，操作靠右；Btn 与发送按钮共用 300ms 忙碌延迟，宽度不变。",
    "zh-TW": "傳送按鈕移到輸入區域外側右邊，等於單行區域的 48px 高度，底部對齊、間距 8px。狀態置中，操作靠右；Btn 與傳送按鈕共用 300ms 忙碌延遲，寬度不變。",
    "en-US": "The send button sits outside on the right, 48px tall like the one-line field, bottom-aligned with an 8px gap. State content is centered, actions stay right; Btn and send share a 300ms busy delay with stable width.",
    "ja-JP": "送信ボタンは入力欄の右外側に置き、1行の欄と同じ48px、下揃え、間隔8pxにする。状態は中央、操作は右。Btn と送信は300msの待機表示遅延を共有し、幅を保つ。",
    "ko-KR": "전송 버튼은 입력창 오른쪽 바깥에 두며 한 줄 영역과 같은 48px 높이로 아래에 맞추고 8px 간격을 둔다. 상태는 중앙, 작업은 오른쪽이다. Btn과 전송 버튼은 300ms 지연과 고정 너비를 공유한다.",
    "fr-FR": "Le bouton est à droite hors du champ, haut de 48px comme le champ à une ligne, aligné en bas avec 8px d’écart. État centré, actions à droite ; Btn et envoi partagent un délai de 300ms sans changement de largeur.",
    "es-ES": "El botón queda fuera a la derecha, mide 48px como el campo de una línea, se alinea abajo y deja 8px. Estado centrado y acciones a la derecha; Btn y envío comparten un retraso de 300ms sin cambiar de ancho.",
    "ru-RU": "Кнопка стоит снаружи справа, имеет высоту 48px как однострочное поле, выровнена по низу с промежутком 8px. Состояние по центру, действия справа; Btn и отправка используют задержку 300мс без изменения ширины."
  },
  "why": {
    "zh-CN": "需要将发送按钮移到输入框外并居中显示处理状态，同时避免短请求的瞬时忙碌图标闪烁。",
    "zh-TW": "需要將傳送按鈕移到輸入框外並置中顯示處理狀態，同時避免短請求的瞬時忙碌圖示閃爍。",
    "en-US": "The send button had to move outside the input with a centered handling state, avoiding spinner flicker on quick requests.",
    "ja-JP": "送信ボタンを入力欄の外に出して状態表示を中央に置き、短い処理での一瞬のスピナーのちらつきをなくすため。",
    "ko-KR": "전송 버튼을 입력창 바깥에 두고 상태 표시를 중앙에 맞추며, 짧은 요청에서의 순간적인 스피너 깜박임을 없애기 위해서다.",
    "fr-FR": "Il fallait placer le bouton d'envoi hors du champ, centrer l'état de traitement et éviter le clignotement de l'indicateur sur les requêtes rapides.",
    "es-ES": "Era necesario sacar el botón de envío fuera del campo, centrar el estado de respuesta y evitar el parpadeo en solicitudes rápidas.",
    "ru-RU": "Требовалось вынести кнопку отправки за пределы поля, центрировать состояние обработки и убрать мерцание индикатора на быстрых запросах."
  }
},
{
  "id": "chat-body-directional-push",
  "date": "2026-11-07",
  "old": {
    "zh-CN": "第 7 轮切换聊天条目时，旧气泡通过 FlowList 收起，新气泡同时展开。",
    "zh-TW": "第 7 輪切換聊天項目時，舊氣泡透過 FlowList 收起，新氣泡同時展開。",
    "en-US": "Round 7 collapsed old chat bubbles and expanded new ones simultaneously through FlowList on item switches.",
    "ja-JP": "第7回の会話切替は FlowList で旧吹き出しを閉じながら新しい吹き出しを開いていた。",
    "ko-KR": "7차 채팅 전환은 FlowList로 기존 말풍선을 접으며 새 말풍선을 동시에 펼쳤다.",
    "fr-FR": "Au tour 7, FlowList repliait les anciennes bulles et déployait les nouvelles simultanément au changement de conversation.",
    "es-ES": "La ronda 7 contraía las burbujas antiguas y expandía las nuevas simultáneamente con FlowList al cambiar de conversación.",
    "ru-RU": "В раунде 7 при смене диалога FlowList одновременно сворачивал старые сообщения и раскрывал новые."
  },
  "now": {
    "zh-CN": "仅条目切换改为正文整层竖向推移：方向来自列表顺序，等高相邻层不透明、不重叠，裁切在正文内，共用 420ms 导航曲线。新正文绘制前定位末尾；同一条目追加仍逐条展开，公共区域保持不动。",
    "zh-TW": "僅項目切換改為正文整層垂直推移：方向來自清單順序，等高相鄰層不透明、不重疊，裁切在正文內，共用 420ms 導覽曲線。新正文繪製前定位末尾；同一項目追加仍逐條展開，公共區域保持不動。",
    "en-US": "Only item switches push the whole body vertically in list order. Equal-height adjacent layers stay opaque and non-overlapping, clipped to the body, on the 420ms navigation curve. New bodies start at the scroll end; same-item appends still expand individually and shared regions stay still.",
    "ja-JP": "会話切替だけ本文全体を一覧順に縦へ押す。同じ高さの隣接層を不透明のまま重ねず本文内で切り抜き、420msのナビ曲線を使う。新本文は描画前に末尾へ移動する。同じ会話への追加は個別展開し共通部分は固定する。",
    "ko-KR": "항목 전환만 목록 순서에 따라 본문 전체를 세로로 민다. 같은 높이의 인접 층은 불투명하게 겹치지 않고 본문 안에서 잘리며 420ms 탐색 곡선을 쓴다. 새 본문은 미리 끝으로 스크롤한다. 같은 항목의 추가는 개별 확장하고 공통 영역은 고정한다.",
    "fr-FR": "Seuls les changements d’élément poussent le corps entier verticalement dans l’ordre de la liste. Couches adjacentes de même hauteur, opaques, sans chevauchement, rognées au corps sur la courbe de 420ms. Le nouveau corps est déjà en bas ; les ajouts au même élément se déploient seuls, les zones communes restent fixes.",
    "es-ES": "Solo los cambios de elemento empujan todo el cuerpo verticalmente según la lista. Capas adyacentes de igual altura, opacas, sin superponerse, recortadas al cuerpo con la curva de 420ms. El cuerpo nuevo ya está al final; los mensajes del mismo elemento se expanden por separado y las zonas comunes quedan fijas.",
    "ru-RU": "Только смена элемента сдвигает всё тело по вертикали в порядке списка. Соседние слои равной высоты непрозрачны, не перекрываются, обрезаны телом и движутся по кривой 420мс. Новый слой уже прокручен до конца; добавления раскрываются отдельно, общие области неподвижны."
  },
  "why": {
    "zh-CN": "底部锚定的消息同时收缩与展开会从中间向两侧散开，缺少统一方向，结束时还可能跳到末尾。",
    "zh-TW": "底部錨定的訊息同時收縮與展開會從中間向兩側散開，缺少統一方向，結束時還可能跳到末尾。",
    "en-US": "Bottom-anchored bubbles collapsing and expanding together spread from the middle rather than moving in one direction, and can jump to the end afterward.",
    "ja-JP": "下端固定の吹き出しを同時に開閉すると中央から上下へ散らばり、方向が揃わず、最後に末尾へ飛ぶこともある。",
    "ko-KR": "아래쪽에 고정된 말풍선이 동시에 접히고 펼쳐지면 중앙에서 양쪽으로 퍼져 방향이 통일되지 않고 끝에서 스크롤이 튈 수 있다.",
    "fr-FR": "Les bulles ancrées en bas se dispersent depuis le milieu quand elles se replient et se déploient ensemble, puis peuvent sauter à la fin.",
    "es-ES": "Las burbujas ancladas abajo se dispersan desde el centro al contraerse y expandirse a la vez, y pueden saltar al final después.",
    "ru-RU": "Одновременное сворачивание и раскрытие сообщений у нижней границы разбрасывает их от центра вместо единого движения и может вызвать скачок прокрутки в конце."
  }
},
{
  "id": "sidebar-connection-status",
  "date": "2026-11-07",
  "old": {
    "zh-CN": "侧栏底部单独放置彩色「在线」Tag，或在收起后隐藏连接文字。",
    "zh-TW": "側欄底部單獨放置彩色「在線」Tag，或在收起後隱藏連線文字。",
    "en-US": "The sidebar foot used a bare colored “Online” Tag or hid connection text when collapsed.",
    "ja-JP": "サイドバー下部に色付きの「オンライン」Tag だけを置くか、折りたたむと接続文字を隠していた。",
    "ko-KR": "사이드바 하단에 색이 있는 ‘온라인’ Tag만 놓거나 접으면 연결 문구를 숨겼다.",
    "fr-FR": "Le bas de la barre latérale affichait un Tag « En ligne » coloré isolé ou masquait la connexion en mode réduit.",
    "es-ES": "El pie lateral mostraba un Tag « En línea » coloreado y aislado u ocultaba la conexión al contraerse.",
    "ru-RU": "Внизу панели стоял отдельный цветной Tag «В сети», либо текст соединения скрывался при сворачивании."
  },
  "now": {
    "zh-CN": "使用与导航项同尺寸的 SidebarStatus：状态图标、对象与状态文字；收起后保留图标、Tooltip 和无障碍名称。",
    "zh-TW": "使用與導覽項同尺寸的 SidebarStatus：狀態圖示、對象與狀態文字；收起後保留圖示、Tooltip 和無障礙名稱。",
    "en-US": "SidebarStatus matches navigation rows with a state icon and subject/state label; collapsed rows keep the icon, Tooltip and accessible name.",
    "ja-JP": "SidebarStatus はナビ項目と同じ寸法で状態アイコンと対象・状態の文字を表示し、折りたたみ時もアイコン、Tooltip、アクセシブルな名前を保つ。",
    "ko-KR": "SidebarStatus는 탐색 항목과 같은 크기로 상태 아이콘과 대상·상태 문구를 표시하며 접어도 아이콘, Tooltip, 접근성 이름을 유지한다.",
    "fr-FR": "SidebarStatus reprend les dimensions de la navigation avec une icône et un libellé sujet/état ; en mode réduit, l’icône, le Tooltip et le nom accessible restent présents.",
    "es-ES": "SidebarStatus usa las dimensiones de navegación con icono y texto de sujeto/estado; al contraer conserva el icono, Tooltip y nombre accesible.",
    "ru-RU": "SidebarStatus повторяет размеры навигации, показывает значок и подпись объекта и состояния; при сворачивании сохраняет значок, Tooltip и доступное имя."
  },
  "why": {
    "zh-CN": "孤立的状态词缺少对象与位置联系，收起后也无法辨认连接状态。",
    "zh-TW": "孤立的狀態詞缺少對象與位置聯繫，收起後也無法辨認連線狀態。",
    "en-US": "An isolated state word does not identify its subject or belong to a row, and the connection becomes unclear when collapsed.",
    "ja-JP": "状態の単語だけでは対象と配置の関係が分からず、折りたたむと接続状態も判別できない。",
    "ko-KR": "상태 단어만으로는 대상과 행의 관계를 알 수 없고 접으면 연결 상태도 식별할 수 없다.",
    "fr-FR": "Un mot d’état isolé ne précise ni son sujet ni sa place dans la liste ; la connexion devient illisible en mode réduit.",
    "es-ES": "Una palabra de estado aislada no identifica el sujeto ni su lugar en la lista, y la conexión deja de reconocerse al contraer.",
    "ru-RU": "Отдельное слово состояния не указывает объект и не связано со строкой; при сворачивании состояние соединения становится неясным."
  }
},
{
  id: "queue-opaque-slide",
  date: "2026-11-07",
  old: {
    "zh-CN": "QueueList 筛选切换使用短距离位移与交叉淡入淡出。",
    "zh-TW": "QueueList 篩選切換使用短距離位移與交叉淡入淡出。",
    "en-US": "QueueList filter changes used short offsets and a crossfade.",
    "ja-JP": "QueueList の絞り込み切替は短い移動とクロスフェードを使っていた。",
    "ko-KR": "QueueList 필터 전환은 짧은 이동과 교차 페이드를 사용했다.",
    "fr-FR": "Les filtres de QueueList utilisaient un court déplacement avec fondu croisé.",
    "es-ES": "Los filtros de QueueList usaban desplazamientos cortos con fundido cruzado.",
    "ru-RU": "Фильтры QueueList сменялись с коротким сдвигом и перекрёстным затуханием.",
  },
  now: {
    "zh-CN": "两层全程不透明，并排平移一整宽；横向裁切，沿用 420ms 导航曲线。",
    "zh-TW": "兩層全程不透明，並排平移一整寬；橫向裁切，沿用 420ms 導覽曲線。",
    "en-US": "Opaque layers slide side by side a full width, clipped horizontally, on the 420ms navigation curve.",
    "ja-JP": "不透明な二層を全幅で並べて移動し、横方向を切り抜く。420ms のナビ曲線を共用する。",
    "ko-KR": "불투명한 두 층을 전체 너비만큼 나란히 이동하고 가로로 자르며 420ms 탐색 곡선을 공유한다.",
    "fr-FR": "Les couches opaques glissent côte à côte sur une largeur, rognées horizontalement, en 420ms.",
    "es-ES": "Las capas opacas se deslizan lado a lado un ancho, con recorte horizontal y la curva de navegación de 420ms.",
    "ru-RU": "Непрозрачные слои идут рядом на полную ширину с обрезкой по горизонтали и кривой навигации 420ms.",
  },
  why: {
    "zh-CN": "半透明文字在切换途中重叠，导致每行出现重影。",
    "zh-TW": "半透明文字在切換途中重疊，導致每列出現重影。",
    "en-US": "Overlapping translucent text made every row appear doubled during the switch.",
    "ja-JP": "半透明の文字が切替中に重なり、各行が二重に見えたため。",
    "ko-KR": "전환 도중 반투명 글자가 겹쳐 모든 행이 이중으로 보였기 때문이다.",
    "fr-FR": "Le texte translucide superposé dédoublait chaque ligne pendant la transition.",
    "es-ES": "El texto translúcido superpuesto duplicaba visualmente cada fila durante el cambio.",
    "ru-RU": "Наложение полупрозрачного текста вызывало двоение каждой строки при смене фильтра.",
  },
},
{
  id: "queue-row-reflow",
  date: "2026-11-06",
  old: {
    "zh-CN": "工作队列筛选与追加沿用 FlowList 的逐行重排。",
    "zh-TW": "工作佇列篩選與追加沿用 FlowList 的逐列重排。",
    "en-US": "Work queue filters and appends used FlowList row reflow.",
    "ja-JP": "作業キューの絞り込みと追加で FlowList の行再配置を使っていた。",
    "ko-KR": "작업 대기열의 필터와 추가에 FlowList 행 재배치를 사용했다.",
    "fr-FR": "Les filtres et ajouts des files utilisaient le réagencement des lignes de FlowList.",
    "es-ES": "Los filtros y añadidos de las colas usaban la redistribución por filas de FlowList.",
    "ru-RU": "Фильтры и добавления очередей использовали перестройку строк FlowList.",
  },
  now: {
    "zh-CN": "长队列使用 QueueList：筛选整列推移，追加只展开新行，中间增删才移动邻行。",
    "zh-TW": "長佇列使用 QueueList：篩選整列推移，追加只展開新列，中間增刪才移動鄰列。",
    "en-US": "QueueList pushes scopes as a whole, expands appended rows only, and shifts neighbours " +
      "only for middle changes.",
    "ja-JP": "QueueList は絞り込みを一覧全体で押し移し、末尾の新規行だけ開く。途中の増減だけ隣接行を動かす。",
    "ko-KR": "QueueList는 필터를 목록 전체로 밀고 끝에 추가된 행만 펼친다. 중간의 증감만 이웃 행을 움직인다.",
    "fr-FR": "QueueList pousse les filtres en bloc et déploie seulement les ajouts ; les changements " +
      "au milieu déplacent les voisines.",
    "es-ES": "QueueList empuja filtros completos y expande solo las nuevas filas; los cambios " +
      "intermedios desplazan las vecinas.",
    "ru-RU": "QueueList сдвигает фильтры целиком, раскрывает только новые строки; соседи движутся лишь " +
      "при изменениях в середине.",
  },
  why: {
    "zh-CN": "长队列同时洗牌般移动会分散处理人员的注意力。",
    "zh-TW": "長佇列同時洗牌般移動會分散處理人員的注意力。",
    "en-US": "Simultaneous row shuffling distracts staff working through long queues.",
    "ja-JP": "長いキューで行が一斉に並び替わると担当者の注意が散る。",
    "ko-KR": "긴 대기열에서 행이 동시에 뒤섞이면 담당자의 주의가 분산된다.",
    "fr-FR": "Le mélange simultané des lignes distrait les agents dans les longues files.",
    "es-ES": "El movimiento simultáneo de filas distrae al personal que trabaja con colas largas.",
    "ru-RU": "Одновременное перемешивание строк отвлекает сотрудников в длинных очередях.",
  },
},
{
  id: "label-chip-fill",
  date: "2026-11-06",
  old: {
    "zh-CN": "ChipInput 独自绘制标签，普通只读标签缺少共享组件，浅色填充容易混入表格底色。",
    "zh-TW": "ChipInput 自行繪製標籤，一般唯讀標籤缺少共用元件，淺色填色容易混入表格底色。",
    "en-US": "ChipInput drew its own labels; read-only labels lacked a shared component and pale fills " +
      "blended into tables.",
    "ja-JP": "ChipInput 独自のラベルだけがあり、共通の読み取り専用部品がなく、薄い背景が表に溶け込んでいた。",
    "ko-KR": "ChipInput이 라벨을 따로 그렸고 읽기 전용 공유 컴포넌트가 없어 옅은 배경이 표와 구별되지 않았다.",
    "fr-FR": "ChipInput dessinait ses libellés ; sans composant partagé en lecture seule, les fonds " +
      "pâles se confondaient avec la table.",
    "es-ES": "ChipInput dibujaba sus etiquetas; sin componente compartido de solo lectura, los fondos " +
      "claros se confundían con la tabla.",
    "ru-RU": "ChipInput рисовал метки отдельно; общего компонента для чтения не было, светлая заливка " +
      "сливалась с таблицей.",
  },
  now: {
    "zh-CN": "只读标签和 ChipInput 共用 Chip，使用中性不透明填充与次要文字色；Tag 继续表示状态。",
    "zh-TW": "唯讀標籤和 ChipInput 共用 Chip，使用中性不透明填色與次要文字色；Tag 繼續表示狀態。",
    "en-US": "Read-only labels and ChipInput share Chip with opaque neutral fill and secondary text; " +
      "Tag remains for statuses.",
    "ja-JP": "読み取り専用ラベルと ChipInput は中立色の不透明な背景と補助文字色の Chip を共有し、状態には Tag を使う。",
    "ko-KR": "읽기 전용 라벨과 ChipInput은 불투명 중립 배경과 보조 텍스트 색의 Chip을 공유한다. 상태에는 Tag를 쓴다.",
    "fr-FR": "Les libellés et ChipInput partagent Chip, au fond neutre opaque et texte secondaire ; " +
      "Tag reste pour les états.",
    "es-ES": "Las etiquetas y ChipInput comparten Chip, con fondo neutro opaco y texto secundario; Tag " +
      "sigue indicando estados.",
    "ru-RU": "Метки и ChipInput используют общий Chip с непрозрачной нейтральной заливкой; Tag " +
      "остаётся для состояний.",
  },
  why: {
    "zh-CN": "标签需要在深浅主题的页面、分组和表面上清楚可读，并避免产品各自制造样式。",
    "zh-TW": "標籤需要在深淺主題的頁面、群組和表面上清楚可讀，並避免產品各自製造樣式。",
    "en-US": "Labels must remain legible on page, group and surface backgrounds in both themes, with " +
      "one shared appearance.",
    "ja-JP": "両テーマのページ、グループ、表面でラベルを読みやすくし、外観を一つに統一するため。",
    "ko-KR": "두 테마의 페이지, 그룹, 표면 배경에서 라벨을 읽기 쉽게 유지하고 모양을 통일한다.",
    "fr-FR": "Les libellés doivent rester lisibles sur les différents fonds des deux thèmes, avec une " +
      "apparence commune.",
    "es-ES": "Las etiquetas deben ser legibles sobre todos los fondos en ambos temas y compartir un " +
      "mismo aspecto.",
    "ru-RU": "Метки должны читаться на фоне страницы, групп и поверхностей в обеих темах и иметь общий " +
      "вид.",
  },
},
{
  id: "chat-composer-field",
  date: "2026-11-06",
  old: {
    "zh-CN": "聊天输入框与发送按钮并排，按钮偏低，禁用时强调色整体变淡。",
    "zh-TW": "聊天輸入框與傳送按鈕並排，按鈕偏低，停用時強調色整體變淡。",
    "en-US": "The send button sat beside and below the input row, with a faded accent when disabled.",
    "ja-JP": "送信ボタンが入力欄の横で低く配置され、無効時はアクセント色全体が薄くなっていた。",
    "ko-KR": "전송 버튼이 입력 행 옆에서 아래로 치우쳤고 비활성화 시 강조색이 흐려졌다.",
    "fr-FR": "Le bouton d’envoi était à côté du champ, trop bas, avec un accent estompé à l’état désactivé.",
    "es-ES": "El botón de envío quedaba junto al campo, demasiado bajo y con el acento atenuado al desactivarse.",
    "ru-RU": "Кнопка отправки стояла рядом с полем и ниже строки; при отключении акцентный цвет бледнел.",
  },
  now: {
    "zh-CN": "统一圆角输入区域内置 32px 圆形发送按钮，禁用使用中性色，发送中显示旋转指示；处理状态在上方突出显示。",
    "zh-TW": "統一圓角輸入區域內建 32px 圓形傳送按鈕，停用使用中性色，傳送中顯示旋轉指示；處理狀態在上方突出顯示。",
    "en-US": "One rounded field contains a 32px round send button, neutral disabled fill and a busy spinner. " +
      "A prominent handling bar sits above it.",
    "ja-JP": "角丸の入力欄に32pxの丸い送信ボタンを内蔵し、無効時は中立色、送信中は回転表示にする。上に担当状況を明示する。",
    "ko-KR": "둥근 입력 영역에 32px 원형 전송 버튼을 넣고 비활성화는 중립색, 전송 중은 회전 표시를 쓴다. 처리 상태는 위에 표시한다.",
    "fr-FR": "Un champ arrondi contient un bouton rond de 32px, neutre si désactivé, animé pendant l’envoi. " +
      "Une barre visible indique qui traite la conversation.",
    "es-ES": "Un campo redondeado incluye un botón circular de 32px, neutro al desactivarse y con indicador " +
      "giratorio al enviar. La atención se muestra en una barra superior.",
    "ru-RU": "В общее поле встроена круглая кнопка 32px: нейтральная при отключении, со спиннером при отправке. " +
      "Выше расположена заметная полоса состояния обработки.",
  },
  why: {
    "zh-CN": "发送按钮应与单行输入等高，并在输入增长时保持右下位置；处理归属应清楚可见。",
    "zh-TW": "傳送按鈕應與單行輸入等高，並在輸入增長時保持右下位置；處理歸屬應清楚可見。",
    "en-US": "The button must match a single input row and stay bottom-right as text grows; ownership must be clear.",
    "ja-JP": "ボタンを入力1行と同じ高さにし、入力が増えても右下に保つ。対応の担当も明確にする。",
    "ko-KR": "버튼은 한 줄 입력과 높이가 같고 글이 늘어도 오른쪽 아래에 있어야 한다. 처리 주체도 명확해야 한다.",
    "fr-FR": "Le bouton doit avoir la hauteur d’une ligne et rester en bas à droite ; le responsable doit être visible.",
    "es-ES": "El botón debe medir lo mismo que una línea y permanecer abajo a la derecha; el responsable debe ser claro.",
    "ru-RU": "Кнопка должна быть высотой в одну строку и оставаться справа внизу; ответственный должен быть виден.",
  },
},
{
  id: "workbench-item-rise",
  date: "2026-11-06",
  old: {
    "zh-CN": "第 5 轮工作台切换条目时，旧详情淡出，标题、字段、操作、提示与正文依次浮现。",
    "zh-TW": "第 5 輪工作台切換項目時，舊詳情淡出，標題、欄位、操作、提示與正文依次浮現。",
    "en-US": "Round 5 faded out the old detail and replayed a staggered rise for headings, fields, " +
      "actions, notice and body.",
    "ja-JP": "第5回では項目切り替え時に旧詳細を消し、見出し、項目、操作、案内、本文を順に浮かび上がらせていた。",
    "ko-KR": "5차 작업대는 항목 전환 시 이전 상세를 흐리게 하고 제목, 필드, 작업, 안내, 본문을 차례로 띄웠다.",
    "fr-FR": "Au tour 5, l’ancien détail disparaissait en fondu, puis titres, champs, actions, avis et" +
      " corps réapparaissaient en séquence.",
    "es-ES": "En la ronda 5, el detalle anterior se desvanecía y títulos, campos, acciones, aviso y " +
      "cuerpo volvían a aparecer en secuencia.",
    "ru-RU": "В раунде 5 старые детали гасли, а заголовки, поля, действия, уведомление и содержимое " +
      "снова появлялись по очереди.",
  },
  now: {
    "zh-CN": "第 7 轮保留详情实例，控件不动，短文字滚动，正文按 key 折叠与展开；空态切换和窄屏推移保持不变。",
    "zh-TW": "第 7 輪保留詳情實例，控制元件不動，短文字滾動，正文按 key 摺疊與展開；空態切換和窄螢幕推移保持不變。",
    "en-US": "Round 7 retains the detail, keeps controls still, rolls short text and expands or " +
      "collapses keyed blocks. Empty-state replacement and narrow push remain.",
    "ja-JP": "第7回では詳細を保持し、操作は固定、短文はロール、本文はキー別に開閉する。空状態の置換と狭い画面のプッシュは維持する。",
    "ko-KR": "7차는 상세를 유지하고 컨트롤은 고정하며 짧은 글자는 굴리고 블록은 키별로 펼치거나 접는다. 빈 화면 교체와 좁은 화면 밀기는 유지한다.",
    "fr-FR": "Le tour 7 conserve le détail et les commandes, fait défiler le texte court et déploie ou" +
      " replie les blocs par clé. L’état vide et la poussée étroite restent.",
    "es-ES": "La ronda 7 conserva el detalle y los controles, desplaza el texto breve y expande o " +
      "contrae bloques por clave. Se mantienen el estado vacío y el empuje estrecho.",
    "ru-RU": "Раунд 7 сохраняет детали и неподвижные элементы управления; короткий текст " +
      "прокручивается, блоки раскрываются по ключам. Пустое состояние и сдвиг узкого экрана " +
      "сохранены.",
  },
  why: {
    "zh-CN": "切换会话只改变内容；操作、菜单和输入框再次运动会破坏位置与焦点的连续性。",
    "zh-TW": "切換對話只改變內容；操作、選單和輸入框再次運動會破壞位置與焦點的連續性。",
    "en-US": "Switching conversations changes content. Moving shared actions, menus and the composer " +
      "breaks positional and focus continuity.",
    "ja-JP": "会話の切り替えで変わるのは内容であり、共通の操作、メニュー、入力欄を動かすと位置とフォーカスの連続性が失われる。",
    "ko-KR": "대화 전환은 내용을 바꾼다. 공통 작업, 메뉴, 입력창을 움직이면 위치와 초점의 연속성이 깨진다.",
    "fr-FR": "Changer de conversation modifie le contenu. Déplacer les actions, menus et le champ de " +
      "saisie communs rompt la continuité de position et de focus.",
    "es-ES": "Cambiar de conversación modifica el contenido. Mover acciones, menús y el editor comunes" +
      " rompe la continuidad de posición y foco.",
    "ru-RU": "Смена диалога меняет содержимое. Движение общих действий, меню и поля ввода нарушает " +
      "непрерывность положения и фокуса.",
  },
},
{
  id: "vertical-page-push",
  date: "2026-11-06",
  old: {
    "zh-CN": "纵向切页时旧页快速淡出，新页按弹簧曲线浮入。",
    "zh-TW": "縱向切頁時舊頁快速淡出，新頁按彈簧曲線浮入。",
    "en-US": "Vertical page switches used a quick fade-out and a spring float-in.",
    "ja-JP": "縦のページ切り替えでは旧ページが素早く消え、新ページがばねの動きで浮かび入っていた。",
    "ko-KR": "세로 페이지 전환에서 이전 페이지는 빠르게 사라지고 새 페이지는 스프링 곡선으로 떠올랐다.",
    "fr-FR": "Le changement vertical associait un fondu rapide à une entrée flottante avec ressort.",
    "es-ES": "El cambio vertical combinaba una salida rápida en fundido y una entrada flotante con resorte.",
    "ru-RU": "При вертикальном переходе старая страница быстро гасла, а новая всплывала с пружинным движением.",
  },
  now: {
    "zh-CN": "纵向切页改为与横向一致的直接推移，新旧页同时运动。",
    "zh-TW": "縱向切頁改為與橫向一致的直接推移，新舊頁同時運動。",
    "en-US": "Vertical page switches use a direct push matching the horizontal one, with both pages moving together.",
    "ja-JP": "縦の切り替えも横と同じ直接的な押し移動にし、新旧ページを同時に動かす。",
    "ko-KR": "세로 전환도 가로와 같은 직접 밀기로 바꾸고 두 페이지를 동시에 움직인다.",
    "fr-FR": "Le changement vertical utilise la même poussée directe que l’horizontal ; les deux pages bougent ensemble.",
    "es-ES": "El cambio vertical usa el mismo empuje directo que el horizontal; ambas páginas se mueven juntas.",
    "ru-RU": "Вертикальный переход использует такой же прямой сдвиг, как горизонтальный; обе страницы движутся вместе.",
  },
  why: {
    "zh-CN": "两页没有同时运动，切换像弹出，方向不清楚。",
    "zh-TW": "兩頁沒有同時運動，切換像彈出，方向不清楚。",
    "en-US": "The two pages did not move together, so the switch felt like a pop and its direction was unclear.",
    "ja-JP": "二つのページが同時に動かず、突然飛び出すように見えて切り替えの方向が不明確だった。",
    "ko-KR": "두 페이지가 함께 움직이지 않아 전환이 갑자기 튀어나오는 듯했고 방향도 불명확했다.",
    "fr-FR": "Les deux pages ne bougeaient pas ensemble ; le changement semblait surgir et sa direction était floue.",
    "es-ES": "Las dos páginas no se movían juntas; el cambio parecía una aparición repentina y su dirección no era clara.",
    "ru-RU": "Страницы двигались не вместе, поэтому переход выглядел как внезапное появление без ясного направления.",
  },
},
{
  "id": "row-card-dividers",
  "date": "2026-11-06",
  "old": {
    "zh-CN": "设置行卡片使用外边框与行间分隔线。",
    "zh-TW": "設定列卡片使用外框與列間分隔線。",
    "en-US": "Settings row cards used outer borders and lines between rows.",
    "ja-JP": "設定行カードに外枠と行間の区切り線を使っていた。",
    "ko-KR": "설정 행 카드에 외곽선과 행 구분선을 사용했다.",
    "fr-FR": "Les cartes de paramètres avaient une bordure et des lignes entre les rangées.",
    "es-ES": "Las tarjetas de ajustes tenían borde exterior y líneas entre filas.",
    "ru-RU": "Карточки настроек имели внешнюю рамку и линии между строками."
  },
  "now": {
    "zh-CN": "设置行只用分组底色与间距；密集列表保留内缩分隔线。",
    "zh-TW": "設定列只用群組底色與間距；密集清單保留內縮分隔線。",
    "en-US": "Settings rows use group surfaces and spacing; dense lists keep inset dividers.",
    "ja-JP": "設定行は背景と余白で分け、密な一覧だけに内側の区切り線を残す。",
    "ko-KR": "설정 행은 그룹 배경과 여백으로 나누고 조밀한 목록에만 안쪽 구분선을 남긴다.",
    "fr-FR": "Les paramètres utilisent le fond et l’espacement ; les listes denses gardent des séparateurs en retrait.",
    "es-ES": "Los ajustes usan fondo y espacio; las listas densas conservan separadores con margen.",
    "ru-RU": "Строки настроек разделяются фоном и отступами; плотные списки сохраняют разделители с отступами."
  },
  "why": {
    "zh-CN": "会话与审核队列的反馈暴露了分隔线使用不一致；统一分组方式，避免把表单切成碎片。",
    "zh-TW": "對話與審核佇列的回饋暴露了分隔線使用不一致；統一群組方式，避免把表單切成碎片。",
    "en-US": "Conversation and review queues exposed inconsistent dividers; consistent grouping keeps " +
      "forms visually connected.",
    "ja-JP": "会話とレビューの画面で区切り線の不統一が判明したため、フォームのまとまりを保つ方式に統一した。",
    "ko-KR": "대화와 검토 화면에서 구분선의 불일치가 드러나 양식의 시각적 연결을 유지하도록 그룹 방식을 통일했다.",
    "fr-FR": "Les files de conversations et de révisions ont révélé des séparateurs incohérents ; les " +
      "formulaires restent ainsi unifiés.",
    "es-ES": "Las colas de conversaciones y revisiones revelaron separadores incoherentes; la agrupación " +
      "uniforme mantiene unidos los formularios.",
    "ru-RU": "Очереди диалогов и проверок выявили непоследовательность разделителей; единая группировка " +
      "сохраняет целостность форм."
  }
},
{
  "id": "setting-switch",
  "date": "2026-11-06",
  "old": {
    "zh-CN": "设置行使用带可见标签的复选框，重复显示标题。",
    "zh-TW": "設定列使用帶可見標籤的核取方塊，重複顯示標題。",
    "en-US": "Settings rows repeated the title beside a checkbox.",
    "ja-JP": "設定行のチェックボックスの横にタイトルを重複表示していた。",
    "ko-KR": "설정 행의 체크박스 옆에 제목이 반복되었다.",
    "es-ES": "Las filas de ajustes repetían el título junto a una casilla.",
    "fr-FR": "Les lignes de paramètres répétaient le titre à côté d’une case.",
    "ru-RU": "Строки настроек повторяли заголовок рядом с флажком."
  },
  "now": {
    "zh-CN": "设置行使用 Switch，选项列表保留 Toggle。",
    "zh-TW": "設定列使用 Switch，選項清單保留 Toggle。",
    "en-US": "Settings rows use Switch; option lists keep Toggle.",
    "ja-JP": "設定行には Switch、選択肢一覧には引き続き Toggle を使う。",
    "ko-KR": "설정 행에는 Switch를 쓰고 옵션 목록에는 Toggle을 유지한다.",
    "es-ES": "Las filas usan Switch; las listas de opciones conservan Toggle.",
    "fr-FR": "Les lignes utilisent Switch ; les listes d’options conservent Toggle.",
    "ru-RU": "Строки настроек используют Switch; списки вариантов сохраняют Toggle."
  },
  "why": {
    "zh-CN": "行标题已经说明设置，开关无需再次显示文字。",
    "zh-TW": "列標題已經說明設定，開關無需再次顯示文字。",
    "en-US": "The row title names the setting, so the switch needs no visible label.",
    "ja-JP": "行のタイトルが設定を説明するため、スイッチに同じ文字は不要。",
    "ko-KR": "행 제목이 설정을 설명하므로 스위치에 같은 문구가 필요 없다.",
    "es-ES": "El título de la fila ya nombra el ajuste; el interruptor no necesita texto visible.",
    "fr-FR": "Le titre de la ligne nomme le paramètre ; aucun texte visible n’est nécessaire sur le commutateur.",
    "ru-RU": "Заголовок строки уже называет настройку, поэтому переключателю не нужен видимый текст."
  }
},
{
  "id": "settingsLayout",
  "date": "2026-11-06",
  "old": {
    "zh-CN": "全宽页面中上下堆叠字段，登录输入框位于左上角。",
    "zh-TW": "全寬頁面中上下堆疊欄位，登入輸入框位於左上角。",
    "en-US": "Full-width pages with vertically stacked fields and a login input at the upper left.",
    "ja-JP": "全幅ページで入力項目を縦に積み、ログイン欄を左上に配置していた。",
    "ko-KR": "전체 너비 페이지에 필드를 세로로 쌓고 로그인 입력란을 왼쪽 위에 배치했다.",
    "fr-FR": "Pages pleine largeur avec champs empilés et connexion en haut à gauche.",
    "es-ES": "Páginas de ancho completo con campos apilados y acceso en la esquina superior izquierda.",
    "ru-RU": "Страницы полной ширины с полями друг под другом и входом в левом верхнем углу."
  },
  "now": {
    "zh-CN": "阅读宽度居中显示设置行卡片，单项任务使用 CenterPanel。",
    "zh-TW": "閱讀寬度置中顯示設定列卡片，單項任務使用 CenterPanel。",
    "en-US": "Centered reading-width settings cards with rows; CenterPanel for single tasks.",
    "ja-JP": "読みやすい幅の設定カードを中央に置き、単一タスクには CenterPanel を使用する。",
    "ko-KR": "읽기 너비의 설정 행 카드를 가운데 배치하고 단일 작업에는 CenterPanel을 사용한다.",
    "fr-FR": "Cartes de paramètres centrées à largeur de lecture ; CenterPanel pour les tâches uniques.",
    "es-ES": "Tarjetas de ajustes centradas con ancho de lectura; CenterPanel para tareas únicas.",
    "ru-RU": "Центрированные карточки настроек с шириной для чтения; CenterPanel для одиночных задач."
  },
  "why": {
    "zh-CN": "店铺客服管理控制台暴露了标签与控件距离过远、登录页空散的问题。参考 ChatGPT 网页设置的居中分组卡片与 Claude 网页设置的紧凑行布局。",
    "zh-TW": "商店客服管理控制台暴露了標籤與控制項距離過遠、登入頁空散的問題。參考 ChatGPT 網頁設定的置中分組卡片與 Claude 網頁設定的緊湊列佈局。",
    "en-US": "A shop customer-service admin console exposed distant labels and controls and a sparse login page. The references were centered grouped cards in ChatGPT web settings and compact rows in Claude web settings.",
    "ja-JP": "店舗カスタマーサポート管理画面で、ラベルと操作部が離れ、ログイン画面が散漫になる問題が見つかった。ChatGPT のウェブ設定の中央カードと Claude のウェブ設定のコンパクトな行を参考にした。",
    "ko-KR": "매장 고객 지원 관리 콘솔에서 제목과 컨트롤이 멀리 떨어지고 로그인 화면이 흩어진 문제가 드러났다. ChatGPT 웹 설정의 가운데 그룹 카드와 Claude 웹 설정의 간결한 행 배치를 참고했다.",
    "fr-FR": "Une console de service client de boutique a révélé des libellés éloignés des contrôles et une connexion dispersée. Les références sont les cartes centrées des paramètres web de ChatGPT et les lignes compactes de Claude.",
    "es-ES": "Una consola de atención al cliente de tienda mostró etiquetas alejadas de los controles y un acceso disperso. Se tomaron como referencia las tarjetas centradas de ajustes web de ChatGPT y las filas compactas de Claude.",
    "ru-RU": "Консоль поддержки клиентов магазина выявила удалённость подписей от управления и пустой экран входа. Ориентиры: центральные группы карточек настроек ChatGPT и компактные строки веб-настроек Claude."
  }
},
  {
    id: "shell-surface",
    date: "2026-11-05",
    old: {
      "zh-CN": "整扇窗口使用同一种底色，标题栏、侧栏与内容区之间没有区分",
      "zh-TW": "整扇視窗使用同一種底色，標題列、側欄與內容區之間沒有區分",
      "en-US": "The whole window used one background; the title bar, sidebar and content area were not distinguished",
      "ja-JP": "ウィンドウ全体が一つの背景色で、タイトルバー、サイドバー、内容エリアの区別がない",
      "ko-KR": "창 전체가 한 가지 배경색이라 제목 표시줄, 사이드바, 내용 영역이 구분되지 않음",
      "fr-FR": "Toute la fenêtre avait un seul fond ; la barre de titre, la barre latérale et le contenu ne se distinguaient pas",
      "es-ES": "Toda la ventana usaba un solo fondo; la barra de título, la barra lateral y el contenido no se distinguían",
      "ru-RU": "Всё окно имело один фон; строка заголовка, боковая панель и содержимое не различались",
    },
    now: {
      "zh-CN": "标题栏与侧栏为白色，内容区为灰白色，四周留出间距并带圆角",
      "zh-TW": "標題列與側欄為白色，內容區為灰白色，四周留出間距並帶圓角",
      "en-US": "The title bar and sidebar are white; the content area is off-white, inset with a margin and rounded corners",
      "ja-JP": "タイトルバーとサイドバーは白、内容エリアは灰白色で、周囲に余白と角丸を設ける",
      "ko-KR": "제목 표시줄과 사이드바는 흰색, 내용 영역은 회백색이며 둘레에 여백과 둥근 모서리를 둠",
      "fr-FR": "La barre de titre et la barre latérale sont blanches ; le contenu est gris clair, en retrait, avec des coins arrondis",
      "es-ES": "La barra de título y la barra lateral son blancas; el contenido es gris claro, con margen y esquinas redondeadas",
      "ru-RU": "Строка заголовка и боковая панель белые; область содержимого светло-серая, с отступом и скруглёнными углами",
    },
    why: {
      "zh-CN": "导航与内容分区清楚，内容区的范围一眼可见。该设计先在图灵枢中使用",
      "zh-TW": "導覽與內容分區清楚，內容區的範圍一眼可見。該設計先在圖靈樞中使用",
      "en-US": "Navigation and content are clearly separated, and the content area is visible at a glance. The design was first used in TRM Nexus",
      "ja-JP": "ナビゲーションと内容がはっきり分かれ、内容エリアの範囲がひと目で分かる。この設計は TRM Nexus で先に使われた",
      "ko-KR": "탐색과 내용이 뚜렷이 나뉘고 내용 영역의 범위가 한눈에 보임. 이 디자인은 TRM Nexus에서 먼저 쓰였음",
      "fr-FR": "La navigation et le contenu sont nettement séparés, et la zone de contenu se voit d'un coup d'œil. Cette conception a d'abord servi dans TRM Nexus",
      "es-ES": "La navegación y el contenido quedan claramente separados y el área de contenido se ve de un vistazo. El diseño se usó primero en TRM Nexus",
      "ru-RU": "Навигация и содержимое чётко разделены, границы области содержимого видны сразу. Решение сначала применили в TRM Nexus",
    },
  },
  {
    id: "crossfade",
    date: "2026-11-01",
    old: {
      "zh-CN": "交叠切换。换分栏、换筛选时旧内容淡出、新内容逐项浮现",
      "zh-TW": "交疊切換。換分欄、換篩選時舊內容淡出、新內容逐項浮現",
      "en-US": "Crossfade. On a tab or filter change, old content faded out and new items rose one by one",
      "ja-JP": "クロスフェード。タブや絞り込みの切り替えで、古い内容が消え、新しい項目が一つずつ浮かび上がる",
      "ko-KR": "교차 전환. 탭이나 필터를 바꾸면 이전 내용이 사라지고 새 항목이 하나씩 떠오름",
      "fr-FR": "Fondu croisé. Au changement d'onglet ou de filtre, l'ancien contenu s'effaçait et les nouveaux éléments apparaissaient un par un",
      "es-ES": "Fundido cruzado. Al cambiar de pestaña o filtro, el contenido anterior se desvanecía y los nuevos elementos aparecían uno a uno",
      "ru-RU": "Перекрёстная смена. При смене вкладки или фильтра старое содержимое гасло, а новые элементы всплывали по одному",
    },
    now: {
      "zh-CN": "推移与伸缩。新旧内容沿同一方向推移，内容区底板保持不变，仅平滑调整高度",
      "zh-TW": "推移與伸縮。新舊內容沿同一方向推移，內容區底板保持不變，僅平滑調整高度",
      "en-US": "Push and stretch. Old and new content move in the same direction; the content panel stays and only changes height smoothly",
      "ja-JP": "プッシュと伸縮。新旧の内容が同じ方向へ押し出され、内容エリアの下地は描き直さず高さだけが滑らかに変わる",
      "ko-KR": "밀기와 늘이기. 이전 내용과 새 내용이 같은 방향으로 밀려 지나가고, 내용 영역의 바탕은 그대로 둔 채 높이만 부드럽게 바뀜",
      "fr-FR": "Poussée et étirement. L'ancien et le nouveau contenu glissent dans le même sens ; le panneau reste en place et seule sa hauteur change en douceur",
      "es-ES": "Empuje y estiramiento. El contenido anterior y el nuevo se desplazan en la misma dirección; el panel se mantiene y solo cambia de altura con suavidad",
      "ru-RU": "Сдвиг и растяжение. Старое и новое содержимое уходит в одну сторону; панель остаётся на месте и плавно меняет только высоту",
    },
    why: {
      "zh-CN": "淡出与逐项浮现分为两段动作，中间出现停顿与闪烁；两层同时半透明时还会出现残影。",
      "zh-TW": "淡出與逐項浮現分為兩段動作，中間出現停頓與閃爍；兩層同時半透明時還會出現殘影。",
      "en-US": "Fading out and then rising item by item were two separate motions with a pause and a flicker between them, and the two half-transparent layers left a ghost image.",
      "ja-JP": "フェードアウトと一つずつの浮かび上がりが別々の動きで、間に止まりとちらつきがあり、二層が同時に半透明になると残像も出ていました。",
      "ko-KR": "사라짐과 하나씩 떠오름이 두 단계로 나뉘어 중간에 멈춤과 깜빡임이 있었고, 두 층이 동시에 반투명해지면 잔상도 생겼습니다.",
      "fr-FR": "Le fondu puis l'apparition élément par élément formaient deux mouvements séparés par une pause et un scintillement, et les deux couches semi-transparentes laissaient une image fantôme.",
      "es-ES": "El fundido y la aparición elemento a elemento eran dos movimientos separados por una pausa y un parpadeo, y las dos capas semitransparentes dejaban una imagen fantasma.",
      "ru-RU": "Угасание и появление по одному были двумя отдельными движениями с паузой и мерцанием между ними, а два полупрозрачных слоя оставляли остаточное изображение.",
    },
  },
  {
    id: "filterSwap",
    date: "2026-11-01",
    old: {
      "zh-CN": "筛选、排序与展开回复时整体替换列表",
      "zh-TW": "篩選、排序與展開回復時整體替換列表",
      "en-US": "Filtering, sorting or expanding replies replaced the whole list with a new batch",
      "ja-JP": "絞り込み、並べ替え、返信の展開でリスト全体を新しいものに差し替える",
      "ko-KR": "필터, 정렬, 답글 펼치기 때 목록 전체를 새 목록으로 교체",
      "fr-FR": "Filtrer, trier ou déplier les réponses remplaçait toute la liste par un nouveau lot",
      "es-ES": "Filtrar, ordenar o desplegar respuestas sustituía toda la lista por un lote nuevo",
      "ru-RU": "Фильтр, сортировка или раскрытие ответов заменяли весь список новым",
    },
    now: {
      "zh-CN": "流动列表。保留的条目移至新位置，移除的条目原地收起，新增的条目展开",
      "zh-TW": "流動列表。保留的條目移至新位置，移除的條目原地收起，新增的條目展開",
      "en-US": "Flow list. Remaining items slide to their new places, removed items collapse in place, and new items open up",
      "ja-JP": "フローリスト。残る項目は新しい位置へ滑り、外れた項目はその場で縮み、新しい項目は広がって現れる",
      "ko-KR": "흐름 목록. 남는 항목은 새 위치로 미끄러지고, 빠지는 항목은 제자리에서 접히며, 새 항목은 펼쳐짐",
      "fr-FR": "Liste fluide. Les éléments restants glissent à leur nouvelle place, ceux retirés se replient sur place et les nouveaux s'ouvrent",
      "es-ES": "Lista fluida. Los elementos que se quedan se deslizan a su nuevo sitio, los que salen se pliegan en su lugar y los nuevos se abren",
      "ru-RU": "Плавный список. Оставшиеся элементы скользят на новые места, убранные сворачиваются на месте, новые раскрываются",
    },
    why: {
      "zh-CN": "多数条目前后不变，整体替换显得像重新加载，也无法看出哪些条目被移除。",
      "zh-TW": "多數條目前後不變，整體替換顯得像重新載入，也無法看出哪些條目被移除。",
      "en-US": "Most items stay through the change. Replacing the whole block looked like a reload and hid which items had been filtered out.",
      "ja-JP": "多くの項目は切り替え後も残ります。全体の差し替えは再読み込みのように見え、どれが外れたのかも分かりませんでした。",
      "ko-KR": "대부분의 항목은 전환 후에도 남습니다. 전체를 바꾸면 다시 불러온 것처럼 보였고 어떤 항목이 빠졌는지도 알 수 없었습니다.",
      "fr-FR": "La plupart des éléments restent. Remplacer tout le bloc ressemblait à un rechargement et masquait les éléments retirés.",
      "es-ES": "La mayoría de los elementos permanecen. Sustituir todo el bloque parecía una recarga y ocultaba cuáles se habían filtrado.",
      "ru-RU": "Большинство элементов остаются. Замена всего блока выглядела как перезагрузка и скрывала, какие элементы отфильтрованы.",
    },
  },
  {
    id: "segmentClick",
    date: "2026-11-01",
    old: {
      "zh-CN": "分段控件的滑块仅可点击，按固定曲线移动后压缩回弹",
      "zh-TW": "分段控制元件的滑塊僅可點選，按固定曲線移動後壓縮回彈",
      "en-US": "The segment control thumb could only be clicked; it slid along a fixed curve and squeezed once",
      "ja-JP": "セグメントコントロールのつまみはクリックのみで、決まった曲線で滑ってから一度縮む",
      "ko-KR": "세그먼트 컨트롤의 손잡이는 클릭만 가능했고, 정해진 곡선으로 미끄러진 뒤 한 번 눌림",
      "fr-FR": "Le curseur du contrôle segmenté ne se cliquait que ; il glissait selon une courbe fixe puis se tassait une fois",
      "es-ES": "El deslizador del control segmentado solo se podía pulsar; se movía con una curva fija y se comprimía una vez",
      "ru-RU": "Ползунок сегментного переключателя можно было только нажимать; он скользил по фиксированной кривой и один раз сжимался",
    },
    now: {
      "zh-CN": "液态玻璃滑块。可拖动，带惯性与弹簧，到达两端时压扁回弹，下方文字放大显示",
      "zh-TW": "液態玻璃滑塊。可拖動，帶慣性與彈簧，到達兩端時壓扁回彈，下方文字放大顯示",
      "en-US": "Liquid glass thumb. It can be dragged, carries momentum and spring, squashes against either end, and magnifies the text beneath it",
      "ja-JP": "リキッドガラスのつまみ。押したままドラッグでき、慣性とばねで動き、両端にぶつかると潰れ、下の文字を拡大して見せる",
      "ko-KR": "리퀴드 글래스 손잡이. 누른 채 끌 수 있고 관성과 스프링으로 움직이며, 양 끝에 부딪히면 눌리고 아래 글자를 확대해 보여 줌",
      "fr-FR": "Curseur en verre liquide. Il se fait glisser, garde l'élan et le ressort, s'écrase contre les extrémités et grossit le texte en dessous",
      "es-ES": "Deslizador de cristal líquido. Se puede arrastrar, conserva la inercia y el resorte, se aplasta contra los extremos y amplía el texto que tiene debajo",
      "ru-RU": "Ползунок из жидкого стекла. Его можно тянуть, он движется по инерции и с пружиной, сплющивается о края и увеличивает текст под собой",
    },
    why: {
      "zh-CN": "固定曲线无法反映操作力度，也无法在中途改变方向。",
      "zh-TW": "固定曲線無法反映操作力度，也無法在中途改變方向。",
      "en-US": "A fixed curve ignores how hard the user moves and cannot change course midway; the thumb should behave like an object in the hand.",
      "ja-JP": "決まった曲線では操作の強さが伝わらず、途中で向きも変えられません。つまみは手に持てる物のように振る舞うべきです。",
      "ko-KR": "정해진 곡선은 사용자가 얼마나 세게 움직였는지 반영하지 못하고 도중에 방향을 바꿀 수도 없습니다. 손잡이는 손에 쥔 물건처럼 움직여야 합니다.",
      "fr-FR": "Une courbe fixe ignore la force du geste et ne peut pas changer de direction en route ; le curseur doit se comporter comme un objet tenu en main.",
      "es-ES": "Una curva fija ignora la fuerza del gesto y no puede cambiar de rumbo a medio camino; el deslizador debe comportarse como un objeto en la mano.",
      "ru-RU": "Фиксированная кривая не учитывает силу движения и не может сменить направление на полпути; ползунок должен вести себя как предмет в руке.",
    },
  },
  {
    id: "sidebarCenter",
    date: "2026-11-01",
    old: {
      "zh-CN": "侧栏收起时先移除文字、将图标居中，再收窄宽度",
      "zh-TW": "側欄收起時先移除文字、將圖示居中，再收窄寬度",
      "en-US": "Collapsing the sidebar removed the labels and re-centred the icons before the width shrank",
      "ja-JP": "サイドバーを畳むとき、先に文字を外してアイコンを中央に寄せてから幅を縮める",
      "ko-KR": "사이드바를 접을 때 먼저 글자를 없애고 아이콘을 가운데로 옮긴 뒤 폭을 줄임",
      "fr-FR": "Replier la barre latérale retirait les libellés et recentrait les icônes avant de réduire la largeur",
      "es-ES": "Al contraer la barra lateral se quitaban las etiquetas y se centraban los iconos antes de reducir el ancho",
      "ru-RU": "При сворачивании боковой панели подписи убирались, а значки перецентрировались до сужения панели",
    },
    now: {
      "zh-CN": "图标保持原位，仅宽度变化，文字随之淡入淡出",
      "zh-TW": "圖示保持原位，僅寬度變化，文字隨之淡入淡出",
      "en-US": "Icons stay where they are; only the width changes and the labels fade with it",
      "ja-JP": "アイコンは常に同じ位置にあり、幅だけが変わって文字がそれに合わせてフェードする",
      "ko-KR": "아이콘은 늘 제자리에 있고 폭만 바뀌며 글자는 그에 맞춰 서서히 사라지고 나타남",
      "fr-FR": "Les icônes restent en place ; seule la largeur change et les libellés s'estompent avec elle",
      "es-ES": "Los iconos se quedan en su sitio; solo cambia el ancho y las etiquetas se desvanecen con él",
      "ru-RU": "Значки остаются на месте; меняется только ширина, а подписи плавно гаснут и появляются",
    },
    why: {
      "zh-CN": "收起时图标先跳到中间再随宽度移动，造成卡顿。",
      "zh-TW": "收起時圖示先跳到中間再隨寬度移動，造成卡頓。",
      "en-US": "The icons jumped to the centre before the width shrank, so expanding was smooth while collapsing stuttered.",
      "ja-JP": "畳むときにアイコンが一度中央へ跳んでから幅と一緒に戻るため、開くのは滑らかでも畳むときに引っかかっていました。",
      "ko-KR": "접을 때 아이콘이 먼저 가운데로 튄 뒤 폭과 함께 돌아와, 펼칠 때는 부드럽고 접을 때는 끊겼습니다.",
      "fr-FR": "Les icônes sautaient au centre avant le rétrécissement : l'ouverture était fluide, la fermeture saccadée.",
      "es-ES": "Los iconos saltaban al centro antes de que se redujera el ancho: al abrir era fluido y al cerrar daba un tirón.",
      "ru-RU": "Значки прыгали к центру до сужения панели: раскрытие было плавным, а сворачивание дёргалось.",
    },
  },
  {
    id: "riseFast",
    date: "2026-11-01",
    old: {
      "zh-CN": "依次浮现。每项间隔 24 毫秒，单项 0.5 秒",
      "zh-TW": "依次浮現。每項間隔 24 毫秒，單項 0.5 秒",
      "en-US": "Staggered rise. 24 ms between items, 0.5 s per item",
      "ja-JP": "順に浮かぶ。項目間 24 ミリ秒、各 0.5 秒",
      "ko-KR": "차례로 떠오름. 항목 간격 24밀리초, 항목당 0.5초",
      "fr-FR": "Apparition décalée. 24 ms entre les éléments, 0,5 s par élément",
      "es-ES": "Aparición escalonada. 24 ms entre elementos, 0,5 s por elemento",
      "ru-RU": "Поочерёдное появление. 24 мс между элементами, 0,5 с на элемент",
    },
    now: {
      "zh-CN": "每项间隔 38 毫秒，单项 0.62 秒，使用换页曲线；推移时不再重复播放",
      "zh-TW": "每項間隔 38 毫秒，單項 0.62 秒，使用換頁曲線；推移時不再重複播放",
      "en-US": "38 ms between items, 0.62 s per item on the page curve; it no longer replays when content is pushed in",
      "ja-JP": "項目間 38 ミリ秒、各 0.62 秒でページ切り替えの曲線に沿って止まる。内容がプッシュされたときは再生しない",
      "ko-KR": "항목 간격 38밀리초, 항목당 0.62초로 페이지 전환 곡선을 따라 멈추며, 내용이 밀려 들어올 때는 다시 재생하지 않음",
      "fr-FR": "38 ms entre les éléments, 0,62 s par élément sur la courbe de page ; l'effet ne se rejoue plus quand le contenu est poussé",
      "es-ES": "38 ms entre elementos, 0,62 s por elemento con la curva de página; ya no se repite cuando el contenido entra empujado",
      "ru-RU": "38 мс между элементами, 0,62 с на элемент по кривой смены страницы; при сдвиге содержимого эффект больше не повторяется",
    },
    why: {
      "zh-CN": "节奏过快，与卡顿相似；每次切换都重复播放，显得像重新加载。",
      "zh-TW": "節奏過快，與卡頓相似；每次切換都重複播放，顯得像重新載入。",
      "en-US": "The rhythm was too fast and read as stutter, and replaying it on every change made the block look reloaded.",
      "ja-JP": "テンポが速すぎて引っかかりに見え、切り替えのたびに再生されるので再読み込みのようにも見えました。",
      "ko-KR": "박자가 너무 빨라 끊기는 것처럼 보였고, 전환할 때마다 다시 재생되어 다시 불러온 것처럼 보였습니다.",
      "fr-FR": "Le rythme trop rapide paraissait saccadé, et le rejouer à chaque changement donnait l'impression d'un rechargement.",
      "es-ES": "El ritmo era demasiado rápido y parecía entrecortado, y repetirlo en cada cambio hacía que el bloque pareciera recargado.",
      "ru-RU": "Слишком быстрый ритм выглядел как подтормаживание, а повтор при каждой смене создавал впечатление перезагрузки.",
    },
  },
  {
    id: "metaDot",
    date: "2026-11-01",
    old: {
      "zh-CN": "一行说明里的几项用「·」连接，例如「2 小时前 · 12 MB」",
      "zh-TW": "一行說明裡的幾項用「·」連接，例如「2 小時前 · 12 MB」",
      "en-US": "Items on one meta line were joined with a middle dot, as in \"2 hours ago · 12 MB\"",
      "ja-JP": "説明行の項目を「·」でつなぐ。例：「2 時間前 · 12 MB」",
      "ko-KR": "설명 한 줄의 항목을 「·」로 이음. 예: 「2시간 전 · 12 MB」",
      "fr-FR": "Les éléments d'une ligne d'informations étaient reliés par un point médian, comme « il y a 2 heures · 12 Mo »",
      "es-ES": "Los elementos de una línea de información se unían con un punto medio, como «hace 2 horas · 12 MB»",
      "ru-RU": "Элементы строки сведений соединялись точкой, например «2 часа назад · 12 МБ»",
    },
    now: {
      "zh-CN": "每项写成「名称：值」，项与项之间只靠间距隔开",
      "zh-TW": "每項寫成「名稱：值」，項與項之間只靠間距隔開",
      "en-US": "Each item is written as \"Name: value\" and items are separated by spacing alone",
      "ja-JP": "各項目を「名前：値」と書き、項目どうしは間隔だけで区切る",
      "ko-KR": "각 항목을 「이름: 값」으로 쓰고 항목 사이는 간격으로만 구분",
      "fr-FR": "Chaque élément s'écrit « Nom : valeur » et les éléments ne sont séparés que par l'espacement",
      "es-ES": "Cada elemento se escribe «Nombre: valor» y los elementos se separan solo con espacio",
      "ru-RU": "Каждый элемент записывается как «Название: значение», а элементы разделяются только отступом",
    },
    why: {
      "zh-CN": "单独的数字与时间无法表明含义，「·」也不是常用的书面标点。",
      "zh-TW": "單獨的數字與時間無法表明含義，「·」也不是常用的書面標點。",
      "en-US": "A bare number or time does not say what it is, and the middle dot is not punctuation users read in formal text.",
      "ja-JP": "数字や時刻だけでは何を指すのか分からず、「·」も利用者が見慣れた書き言葉の記号ではありません。",
      "ko-KR": "숫자나 시간만으로는 무엇인지 알 수 없고, 「·」도 사용자에게 익숙한 문장 부호가 아닙니다.",
      "fr-FR": "Un nombre ou une heure seuls ne disent pas ce qu'ils désignent, et le point médian n'est pas une ponctuation familière.",
      "es-ES": "Un número o una hora sueltos no dicen qué son, y el punto medio no es una puntuación habitual para los usuarios.",
      "ru-RU": "Отдельное число или время не говорят, что они означают, а точка не является привычным знаком препинания.",
    },
  },
  {
    id: "dashJoin",
    date: "2026-11-01",
    old: {
      "zh-CN": "用破折号将两句话合为一句提示",
      "zh-TW": "用破折號將兩句話合為一句提示",
      "en-US": "Two sentences joined into one message with a dash",
      "ja-JP": "ダッシュで二つの文を一つの案内につなぐ",
      "ko-KR": "줄표로 두 문장을 한 안내로 이어 붙임",
      "fr-FR": "Deux phrases reliées en un seul message par un tiret",
      "es-ES": "Dos frases unidas en un solo mensaje con una raya",
      "ru-RU": "Два предложения, соединённые тире в одно сообщение",
    },
    now: {
      "zh-CN": "拆分为完整的句子，或按语法使用逗号、分号与冒号",
      "zh-TW": "拆分為完整的句子，或按語法使用逗號、分號與冒號",
      "en-US": "Complete sentences, or a comma, semicolon or colon where the grammar calls for it",
      "ja-JP": "完全な文に分けるか、文法に合わせて読点や句点でつなぐ",
      "ko-KR": "완전한 문장으로 나누거나 문법에 맞게 쉼표, 쌍점 등으로 이음",
      "fr-FR": "Des phrases complètes, ou une virgule, un point-virgule ou deux-points selon la grammaire",
      "es-ES": "Frases completas, o una coma, un punto y coma o dos puntos según la gramática",
      "ru-RU": "Полные предложения либо запятая, точка с запятой или двоеточие по правилам грамматики",
    },
    why: {
      "zh-CN": "破折号连接的句子关系不明确，各语言的用法也不一致。",
      "zh-TW": "破折號連線的句子關係不明確，各語言的用法也不一致。",
      "en-US": "Dash-joined sentences read like spoken asides, leave the relation unclear and follow different rules in each language.",
      "ja-JP": "ダッシュでつないだ文は口頭の補足のように読め、関係が曖昧で、言語ごとに使い方も異なります。",
      "ko-KR": "줄표로 이은 문장은 말로 덧붙인 것처럼 읽히고 관계가 불분명하며 언어마다 쓰임도 다릅니다.",
      "fr-FR": "Les phrases reliées par un tiret ressemblent à des apartés, la relation reste floue et l'usage varie selon la langue.",
      "es-ES": "Las frases unidas con raya parecen comentarios hablados, la relación queda poco clara y el uso cambia en cada idioma.",
      "ru-RU": "Предложения через тире читаются как устные вставки, связь между ними неясна, а правила в языках разные.",
    },
  },
  {
    id: "focusRing",
    date: "2026-10-31",
    old: {
      "zh-CN": "鼠标点击后也显示焦点环",
      "zh-TW": "滑鼠點擊後也顯示焦點環",
      "en-US": "Focus rings also appeared after mouse clicks",
      "ja-JP": "マウスでクリックした後もフォーカスリングを表示する",
      "ko-KR": "마우스로 클릭한 뒤에도 포커스 테두리를 표시",
      "fr-FR": "L'anneau de focus apparaissait aussi après un clic de souris",
      "es-ES": "El anillo de foco también aparecía tras un clic del ratón",
      "ru-RU": "Рамка фокуса появлялась и после щелчка мышью",
    },
    now: {
      "zh-CN": "焦点环只在用键盘移动焦点时显示",
      "zh-TW": "焦點環只在用鍵盤移動焦點時顯示",
      "en-US": "Focus rings appear only when focus is moved with the keyboard",
      "ja-JP": "フォーカスリングはキーボードでフォーカスを移したときだけ表示する",
      "ko-KR": "포커스 테두리는 키보드로 포커스를 옮길 때만 표시",
      "fr-FR": "L'anneau de focus n'apparaît que lorsque le focus est déplacé au clavier",
      "es-ES": "El anillo de foco solo aparece cuando el foco se mueve con el teclado",
      "ru-RU": "Рамка фокуса появляется только при перемещении фокуса с клавиатуры",
    },
    why: {
      "zh-CN": "使用鼠标时点击位置已知，额外的描边容易被误认为错误。",
      "zh-TW": "使用滑鼠時點選位置已知，額外的描邊容易被誤認為錯誤。",
      "en-US": "Mouse users already know what they clicked; the extra outline looked like an error.",
      "ja-JP": "マウスの利用者はどこを押したか分かっており、余分な枠線は不具合のように見えました。",
      "ko-KR": "마우스 사용자는 이미 어디를 눌렀는지 알고 있어, 추가된 테두리가 오류처럼 보였습니다.",
      "fr-FR": "Les utilisateurs de la souris savent déjà ce qu'ils ont cliqué ; le contour supplémentaire ressemblait à une erreur.",
      "es-ES": "Quien usa el ratón ya sabe qué ha pulsado; el contorno adicional parecía un error.",
      "ru-RU": "Пользователь мыши и так знает, куда нажал; лишняя обводка выглядела как ошибка.",
    },
  },
  {
    id: "iconFill",
    date: "2026-10-30",
    old: {
      "zh-CN": "图标按钮悬停时出现浅灰底",
      "zh-TW": "圖示按鈕懸停時出現淺灰底",
      "en-US": "Icon buttons showed a light grey fill on hover",
      "ja-JP": "アイコンボタンにポインターを重ねると薄い灰色の背景が出る",
      "ko-KR": "아이콘 버튼에 마우스를 올리면 옅은 회색 배경이 나타남",
      "fr-FR": "Les boutons à icône affichaient un fond gris clair au survol",
      "es-ES": "Los botones de icono mostraban un fondo gris claro al pasar el puntero",
      "ru-RU": "Кнопки-значки показывали светло-серый фон при наведении",
    },
    now: {
      "zh-CN": "任何状态都不画底，悬停与选中只改变图标本身的颜色",
      "zh-TW": "任何狀態都不畫底色，懸停與選取只改變圖示本身的顏色",
      "en-US": "No fill in any state; hover and selection change only the icon's own colour",
      "ja-JP": "どの状態でも背景を付けず、ポインターを重ねたときや選択時はアイコン自体の色だけを変える",
      "ko-KR": "어떤 상태에서도 배경을 칠하지 않고, 마우스를 올리거나 선택할 때 아이콘 자체의 색만 바꿈",
      "fr-FR": "Aucun fond dans aucun état ; le survol et la sélection ne changent que la couleur de l'icône",
      "es-ES": "Sin fondo en ningún estado; el puntero y la selección solo cambian el color del icono",
      "ru-RU": "Фон не рисуется ни в каком состоянии; наведение и выбор меняют только цвет самого значка",
    },
    why: {
      "zh-CN": "成排的图标按钮会形成许多小色块，容易与其他控件混淆。",
      "zh-TW": "成排的圖示按鈕會形成許多小色塊，容易與其他控制元件混淆。",
      "en-US": "A row of icon buttons scattered small colour blocks beside the content and looked like a different kind of control.",
      "ja-JP": "並んだアイコンボタンが内容の横に小さな色の塊を作り、別の種類のコントロールのように見えました。",
      "ko-KR": "나란한 아이콘 버튼이 내용 옆에 작은 색 덩어리를 만들어 다른 종류의 컨트롤처럼 보였습니다.",
      "fr-FR": "Une rangée de boutons à icône parsemait le contenu de petits blocs de couleur, comme un autre type de contrôle.",
      "es-ES": "Una fila de botones de icono llenaba el contenido de pequeños bloques de color, como si fuera otro tipo de control.",
      "ru-RU": "Ряд кнопок-значков рассыпал рядом с содержимым цветные пятна и выглядел как другой тип элемента управления.",
    },
  },
];
