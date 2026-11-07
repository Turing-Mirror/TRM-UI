import type { Text } from "./rules";

/**
 * 动效的名字。「动效」页照这份数据渲染，每个名字下面有一个能操作的示范。
 * 和 Agent 沟通时直接说这里的名字或 code，对方就能找到对应的组件与类名。
 */
export type MotionTerm = { id: string; code: string; name: Text; desc: Text };

// Shared with interaction rules so the selection principle has one source.
export const ITEM_SWITCH_RULE: Text = {
  "zh-CN": "切换条目时，共有控件与框架不移动、不淡出；短文字用 Roll，增删块用 Collapse / FlowList，只有新内容入场。禁止整页交叉淡入淡出；依次浮现只用于首次出现。",
  "zh-TW": "切換項目時，共有控制元件與框架不移動、不淡出；短文字用 Roll，增刪區塊用 Collapse / " +
    "FlowList，只有新內容入場。禁止整頁交叉淡入淡出；依次浮現只用於首次出現。",
  "en-US": "When switching items, shared controls and frames stay still and opaque. Short text uses " +
    "Roll; added or removed blocks use Collapse / FlowList. Only new content enters. No " +
    "whole-view crossfade; stagger only on first appearance.",
  "ja-JP": "項目を切り替えても共通の操作と枠は動かさず、薄くしない。短い文字は Roll、ブロックの追加と削除は Collapse / FlowList " +
    "を使う。新しい内容だけが入る。画面全体をクロスフェードせず、順次表示は初回だけにする。",
  "ko-KR": "항목을 바꿔도 공통 컨트롤과 틀은 움직이거나 흐려지지 않는다. 짧은 글자는 Roll, 블록 추가와 제거는 Collapse / FlowList를 쓴다. 새 " +
    "내용만 들어온다. 전체 화면 교차 페이드는 쓰지 않으며 순차 등장은 처음에만 쓴다.",
  "fr-FR": "Au changement d’élément, commandes et cadres communs restent fixes et opaques. Roll " +
    "change le texte court ; Collapse / FlowList ajoute ou retire les blocs. Seul le contenu " +
    "nouveau entre. Aucun fondu global ; apparition décalée au premier affichage seulement.",
  "es-ES": "Al cambiar de elemento, los controles y marcos comunes permanecen fijos y opacos. El " +
    "texto breve usa Roll; los bloques añadidos o retirados usan Collapse / FlowList. Solo " +
    "entra contenido nuevo. Sin fundido global; aparición escalonada solo al inicio.",
  "ru-RU": "При смене элемента общие рамки и элементы управления неподвижны и непрозрачны. Короткий " +
    "текст использует Roll, добавление и удаление блоков — Collapse / FlowList. Входит только" +
    " новое содержимое. Без общего перекрёстного затухания; поочерёдное появление только при " +
    "первом показе.",
};

export const QUEUE_LIST_RULE: Text = {
  "zh-CN": "长工作队列使用 QueueList：筛选按页签方向并排平移一整宽，全程不透明、不重叠，并回到顶部。" +
    "追加只展开新行，原位更新不动；中间增删才带动邻行。FlowList 全量重排用于短列表。",
  "zh-TW": "長工作佇列使用 QueueList：篩選按頁籤方向並排平移一整寬，全程不透明、不重疊，並回到頂部。" +
    "追加只展開新列，原位更新不動；中間增刪才帶動鄰列。FlowList 全量重排用於短清單。",
  "en-US": "Long work queues use QueueList: filters slide side by side a full width in tab order, " +
    "fully opaque without overlap, and reset " +
    "scroll; appends expand only new rows, content updates stay still, and middle inserts or " +
    "removals shift neighbours. Full FlowList reflow is for short lists.",
  "ja-JP": "長い作業キューには QueueList を使う。絞り込みはタブ順に全幅を並べてスライドし、常に不透明で重ならず、先頭へ戻る。" +
    "末尾追加は新しい行だけ開く。内容更新は動かさず、途中の追加・削除だけ隣の行を動" +
    "かす。FlowList の全体再配置は短い一覧向け。",
  "ko-KR": "긴 작업 대기열에는 QueueList를 쓴다. 필터는 탭 순서대로 전체 너비만큼 나란히 이동하며, 항상 불투명하고 겹치지 않으며 맨 위로 돌아간다. " +
    "끝에 추가된 행만 펼치고 내용 갱신은 움직이지 않는다. " +
    "중간 삽입과 제거만 이웃 행을 움직인다. FlowList 전체 재배치는 짧은 목록에 쓴다.",
  "fr-FR": "Les longues files utilisent QueueList : les filtres glissent côte à côte sur une largeur " +
    "entière selon les onglets, toujours opaques et sans chevauchement, puis remontent en haut. " +
    "Seules les nouvelles lignes finales se déploient ; les " +
    "mises à jour restent fixes. Seuls les ajouts ou retraits au milieu déplacent les " +
    "voisines. FlowList reste pour les listes courtes.",
  "es-ES": "Las colas largas usan QueueList: los filtros se deslizan lado a lado un ancho completo " +
    "según las pestañas, siempre opacos y sin superponerse, y vuelven arriba. " +
    "Solo se expanden las filas añadidas al final; actualizar contenido no " +
    "mueve filas. Solo insertar o quitar en medio desplaza las vecinas. FlowList se reserva " +
    "para listas cortas.",
  "ru-RU": "Длинные очереди используют QueueList: фильтры скользят рядом на полную ширину по порядку " +
    "вкладок, всегда непрозрачно и без наложения, и возвращаются наверх. " +
    "В конце раскрываются только новые строки; обновление текста " +
    "неподвижно. Лишь вставка или удаление в середине сдвигает соседей. Полная перестройка " +
    "FlowList — для коротких списков.",
};

export const MOTION_TERMS: MotionTerm[] = [
  {
    id: "queue-list",
    code: "QueueList",
    name: {
      "zh-CN": "长队列",
      "zh-TW": "長佇列",
      "en-US": "Long queues",
      "ja-JP": "長いキュー",
      "ko-KR": "긴 대기열",
      "fr-FR": "Files longues",
      "es-ES": "Colas largas",
      "ru-RU": "Длинные очереди",
    },
    desc: QUEUE_LIST_RULE,
  },
  {
    id: "item-switch",
    code: "WorkbenchDetail, Roll, Collapse, FlowList",
    name: {
      "zh-CN": "不变的部分不动",
      "zh-TW": "不變的部分不動",
      "en-US": "Keep shared parts still",
      "ja-JP": "共通部分は動かさない",
      "ko-KR": "공통 부분은 그대로 둔다",
      "fr-FR": "Garder les parties communes fixes",
      "es-ES": "Mantener fijas las partes comunes",
      "ru-RU": "Общие части неподвижны",
    },
    desc: ITEM_SWITCH_RULE,
  },
  {
    id: "push",
    code: "Swap, Panes, PageHost",
    name: { "zh-CN": "推移", "zh-TW": "推移", "en-US": "Push", "ja-JP": "プッシュ", "ko-KR": "밀기", "fr-FR": "Poussée", "es-ES": "Empuje", "ru-RU": "Сдвиг" },
    desc: {
      "zh-CN": "用于切换分栏、页面与步骤。新旧内容同时推移并淡入淡出，使用相同曲线与时长。横向前进从右侧进入，返回从左侧进入。" +
        "侧栏向下导航时新页从下方进入，向上时反向；纵向切页为 420ms，无缩放、弹簧或延迟。",
      "zh-TW": "用於切換分欄、頁面與步驟。新舊內容同時推移並淡入淡出，使用相同曲線與時長。橫向前進從右側進入，返回從左側進入。" +
        "側欄向下導覽時新頁從下方進入，向上時反向；縱向切頁為 420ms，無縮放、彈簧或延遲。",
      "en-US": "Used for tab, page and step changes. Both layers move and fade together with the same curve " +
        "and duration. Forward horizontal navigation enters from the right; back enters from the left. " +
        "Moving down the sidebar brings the new page from below; moving up reverses it. Vertical page " +
        "switches take 420ms, with no scale, spring or delay.",
      "ja-JP": "タブ、ページ、手順の切り替えに使います。新旧の内容は同じ曲線と時間で同時に移動し、フェードします。" +
        "横方向では進むと右から、戻ると左から入ります。サイドバーを下へ進むと新しいページは下から入り、上へ戻ると逆になります。" +
        "縦の切り替えは 420ms で、拡大縮小、ばね、遅延はありません。",
      "ko-KR": "탭, 페이지, 단계 전환에 씁니다. 두 층이 같은 곡선과 시간으로 동시에 이동하며 나타나고 사라집니다. " +
        "가로 이동은 앞으로 갈 때 오른쪽에서, 뒤로 갈 때 왼쪽에서 들어옵니다. 사이드바에서 아래로 이동하면 새 페이지가 " +
        "아래에서 들어오며 위로 이동하면 반대입니다. 세로 전환은 420ms이며 크기 변화, 스프링, 지연이 없습니다.",
      "fr-FR": "Pour les changements d’onglet, de page et d’étape, les deux couches se déplacent et " +
        "s’estompent ensemble, avec la même courbe et la même durée. À l’horizontale, avancer fait entrer " +
        "par la droite, revenir par la gauche. Descendre dans la barre latérale fait entrer la page " +
        "par le bas ; monter inverse le sens. Le changement vertical dure 420ms, sans zoom, ressort ni délai.",
      "es-ES": "Al cambiar de pestaña, página o paso, ambas capas se mueven y se funden a la vez, con la " +
        "misma curva y duración. En horizontal, avanzar entra por la derecha y volver por la izquierda. " +
        "Al bajar por la barra lateral, la página entra desde abajo; al subir, se invierte el sentido. " +
        "El cambio vertical dura 420ms, sin escala, resorte ni retraso.",
      "ru-RU": "При смене вкладки, страницы и шага оба слоя движутся и меняют прозрачность одновременно, " +
        "с одной кривой и длительностью. По горизонтали движение вперёд вводит страницу справа, назад — " +
        "слева. При переходе вниз по боковой панели новая страница входит снизу, вверх — наоборот. " +
        "Вертикальный переход длится 420ms, без масштабирования, пружины и задержки.",
    },
  },
  {
    id: "stretch",
    code: "Morph",
    name: { "zh-CN": "伸缩", "zh-TW": "伸縮", "en-US": "Stretch", "ja-JP": "伸縮", "ko-KR": "늘이기", "fr-FR": "Étirement", "es-ES": "Estiramiento", "ru-RU": "Растяжение" },
    desc: {
      "zh-CN": "内容增减时，内容区底板保持不变，高度平滑过渡，下方内容随之移动。推移与流动列表均在伸缩之内运行。",
      "zh-TW": "內容增減時，內容區底板保持不變，高度平滑過渡，下方內容隨之移動。推移與流動列表均在伸縮之內執行。",
      "en-US": "When content grows or shrinks, the content panel stays and its height changes smoothly; the content below moves with it. Push and flow list both run inside a stretch.",
      "ja-JP": "内容が増減するとき、内容エリアの下地はそのままで高さが滑らかに変わり、下の内容も一緒に動きます。プッシュとフローリストはどちらも伸縮の中で動きます。",
      "ko-KR": "내용이 늘거나 줄 때 내용 영역의 바탕은 그대로 두고 높이만 부드럽게 바뀌며, 아래 내용도 함께 움직입니다. 밀기와 흐름 목록은 모두 늘이기 안에서 동작합니다.",
      "fr-FR": "Quand le contenu augmente ou diminue, le panneau reste et sa hauteur change en douceur ; le contenu situé dessous suit. La poussée et la liste fluide fonctionnent toutes deux à l'intérieur d'un étirement.",
      "es-ES": "Cuando el contenido crece o disminuye, el panel se mantiene y su altura cambia con suavidad; el contenido inferior se mueve con él. El empuje y la lista fluida funcionan dentro de un estiramiento.",
      "ru-RU": "Когда содержимого становится больше или меньше, панель остаётся на месте и плавно меняет высоту, а содержимое ниже сдвигается вместе с ней. Сдвиг и плавный список работают внутри растяжения.",
    },
  },
  {
    id: "flow",
    code: "FlowList",
    name: { "zh-CN": "流动列表", "zh-TW": "流動列表", "en-US": "Flow list", "ja-JP": "フローリスト", "ko-KR": "흐름 목록", "fr-FR": "Liste fluide", "es-ES": "Lista fluida", "ru-RU": "Плавный список" },
    desc: {
      "zh-CN": "同一列表切换筛选、排序或展开更多时，保留的条目移至新位置，移除的条目原地收起，新增的条目展开显示。适用于前后多数条目不变的列表，例如评论与文件。",
      "zh-TW": "同一列表切換篩選、排序或展開更多時，保留的條目移至新位置，移除的條目原地收起，新增的條目展開顯示。適用於前後多數條目不變的列表，例如評論與檔案。",
      "en-US": "When the same list is filtered, re-sorted or expanded, remaining items move to their new positions, removed items collapse in place and new items expand. Suited to lists where most items stay, such as comments and files.",
      "ja-JP": "同じ一覧で絞り込み、並べ替え、さらに表示を行うと、残る項目は新しい位置へ移り、外れた項目はその場で縮み、新しい項目は広がって現れます。コメントやファイルなど、前後で大半の項目が変わらない一覧に向いています。",
      "ko-KR": "같은 목록을 필터링하거나 정렬을 바꾸거나 더 펼치면, 남는 항목은 새 위치로 옮겨지고 빠지는 항목은 제자리에서 접히며 새 항목은 펼쳐집니다. 댓글이나 파일처럼 대부분의 항목이 그대로인 목록에 맞습니다.",
      "fr-FR": "Quand une même liste est filtrée, triée autrement ou développée, les éléments conservés rejoignent leur nouvelle place, les éléments retirés se replient sur place et les nouveaux se déploient. Convient aux listes dont la plupart des éléments restent, comme les commentaires et les fichiers.",
      "es-ES": "Cuando una misma lista se filtra, se reordena o se amplía, los elementos que quedan pasan a su nueva posición, los que se quitan se contraen en su sitio y los nuevos se expanden. Adecuada para listas en las que la mayoría de los elementos se mantiene, como comentarios y archivos.",
      "ru-RU": "Когда один и тот же список фильтруется, пересортировывается или раскрывается, оставшиеся элементы перемещаются на новые места, удалённые сворачиваются на месте, новые разворачиваются. Подходит для списков, где большинство элементов сохраняется, например комментариев и файлов.",
    },
  },
  {
    id: "roll",
    code: "Roll",
    name: { "zh-CN": "滚字", "zh-TW": "滾字", "en-US": "Roll", "ja-JP": "ロール", "ko-KR": "글자 굴리기", "fr-FR": "Défilement du texte", "es-ES": "Rodillo", "ru-RU": "Прокрутка текста" },
    desc: {
      "zh-CN": "同一位置的文字变化时（如当前项名称、标题与计数），旧文字向下移出，新文字从上方移入，外框保持不动。",
      "zh-TW": "同一位置的文字變化時（如當前項名稱、標題與計數），舊文字向下移出，新文字從上方移入，外框保持不動。",
      "en-US": "When the text in one place changes (such as the current item's name, a title or a count), the old text moves out downwards and the new text moves in from above; the frame stays still.",
      "ja-JP": "同じ場所の文字が変わるとき（現在の項目名、見出し、件数など）、古い文字は下へ抜け、新しい文字は上から入ります。枠は動きません。",
      "ko-KR": "같은 자리의 글자가 바뀔 때(현재 항목 이름, 제목, 개수 등) 이전 글자는 아래로 빠지고 새 글자는 위에서 들어옵니다. 테두리는 움직이지 않습니다.",
      "fr-FR": "Quand le texte d'un même endroit change (nom de l'élément actuel, titre, compteur), l'ancien texte sort par le bas et le nouveau entre par le haut ; le cadre ne bouge pas.",
      "es-ES": "Cuando cambia el texto de un mismo lugar (nombre del elemento actual, título o recuento), el texto anterior sale hacia abajo y el nuevo entra desde arriba; el marco no se mueve.",
      "ru-RU": "Когда текст в одном месте меняется (имя текущего элемента, заголовок, счётчик), старый текст уходит вниз, а новый входит сверху; рамка остаётся на месте.",
    },
  },
  {
    id: "curtain",
    code: ".curtain-in, .curtain-out",
    name: { "zh-CN": "拉幕", "zh-TW": "拉幕", "en-US": "Curtain", "ja-JP": "幕開き", "ko-KR": "막 펼치기", "fr-FR": "Rideau", "es-ES": "Telón", "ru-RU": "Занавес" },
    desc: {
      "zh-CN": "区域首次出现时自上而下展开，关闭时自下而上收起。区域内的后续变化使用滚字或推移。",
      "zh-TW": "區域首次出現時自上而下展開，關閉時自下而上收起。區域內的後續變化使用滾字或推移。",
      "en-US": "An area opens from top to bottom when it first appears and closes from bottom to top. Later changes inside it use roll or push.",
      "ja-JP": "領域は初めて表示されるとき上から下へ開き、閉じるときは下から上へ戻ります。その後の中身の変化にはロールかプッシュを使います。",
      "ko-KR": "영역은 처음 나타날 때 위에서 아래로 펼쳐지고, 닫힐 때는 아래에서 위로 접힙니다. 그 뒤 안쪽 내용의 변화에는 글자 굴리기나 밀기를 씁니다.",
      "fr-FR": "Une zone s'ouvre de haut en bas à sa première apparition et se referme de bas en haut. Les changements suivants à l'intérieur utilisent le défilement du texte ou la poussée.",
      "es-ES": "Un área se abre de arriba abajo al aparecer por primera vez y se cierra de abajo arriba. Los cambios posteriores en su interior usan el rodillo o el empuje.",
      "ru-RU": "Область при первом появлении раскрывается сверху вниз, а при закрытии сворачивается снизу вверх. Последующие изменения внутри неё используют прокрутку текста или сдвиг.",
    },
  },
  {
    id: "collapse",
    code: "Collapse",
    name: { "zh-CN": "折叠", "zh-TW": "摺疊", "en-US": "Collapse", "ja-JP": "折りたたみ", "ko-KR": "접기", "fr-FR": "Repli", "es-ES": "Plegado", "ru-RU": "Сворачивание" },
    desc: {
      "zh-CN": "用于可展开的行、回复框与说明段落。展开时高度从零过渡到内容高度，收起时反向过渡，内容同时淡入或淡出。收起结束后再移除元素。",
      "zh-TW": "用於可展開的行、回覆框與說明段落。展開時高度從零過渡到內容高度，收起時反向過渡，內容同時淡入或淡出。收起結束後再移除元素。",
      "en-US": "Used for expandable rows, reply boxes and description sections. Expanding animates the height from zero to the content height and collapsing reverses it, while the content fades in or out. The element is removed only after collapsing ends.",
      "ja-JP": "展開できる行、返信欄、説明の段落に使います。展開では高さがゼロから内容の高さへ、折りたたみでは逆に変わり、内容も同時にフェードします。折りたたみが終わってから要素を取り除きます。",
      "ko-KR": "펼칠 수 있는 행, 답글 상자, 설명 단락에 씁니다. 펼칠 때는 높이가 0에서 내용 높이로, 접을 때는 반대로 바뀌며 내용도 함께 나타나거나 사라집니다. 접기가 끝난 뒤 요소를 없앱니다.",
      "fr-FR": "Sert aux lignes dépliables, zones de réponse et paragraphes d'explication. Au dépliage, la hauteur passe de zéro à celle du contenu, et l'inverse au repliage, pendant que le contenu apparaît ou disparaît en fondu. L'élément n'est retiré qu'à la fin du repliage.",
      "es-ES": "Se usa en filas desplegables, cuadros de respuesta y párrafos explicativos. Al desplegar, la altura pasa de cero a la del contenido, y al plegar ocurre lo contrario, mientras el contenido aparece o desaparece con un fundido. El elemento se quita solo cuando termina el plegado.",
      "ru-RU": "Применяется к раскрывающимся строкам, полям ответа и поясняющим абзацам. При раскрытии высота растёт от нуля до высоты содержимого, при сворачивании наоборот, а содержимое одновременно проявляется или гаснет. Элемент удаляется только после окончания сворачивания.",
    },
  },
  {
    id: "glass",
    code: "SegmentControl",
    name: { "zh-CN": "液态玻璃滑块", "zh-TW": "液態玻璃滑塊", "en-US": "Liquid glass thumb", "ja-JP": "リキッドガラスのつまみ", "ko-KR": "리퀴드 글래스 손잡이", "fr-FR": "Curseur en verre liquide", "es-ES": "Deslizador de cristal líquido", "ru-RU": "Ползунок из жидкого стекла" },
    desc: {
      "zh-CN": "分段控件的滑块，可点击也可拖动。滑块位置由弹簧计算，中途改变方向时从当前位置继续移动。松开时根据速度决定停在哪一项。快速拖向两端时，滑块压扁后回弹。滑块下方的文字放大显示。点击时滑块移到目标后切换，拖动时松开即切换。",
      "zh-TW": "分段控制元件的滑塊，可點選也可拖動。滑塊位置由彈簧計算，中途改變方向時從當前位置繼續移動。鬆開時根據速度決定停在哪一項。快速拖向兩端時，滑塊壓扁後回彈。滑塊下方的文字放大顯示。點選時滑塊移到目標後切換，拖動時鬆開即切換。",
      "en-US": "The thumb of a segment control, which can be clicked or dragged. A spring computes its position, so a change of direction continues from where it is. On release, its speed decides which option it stops on. Dragged quickly to either end, it squashes and springs back. The text under the thumb is magnified. A click switches once the thumb reaches the target; a drag switches on release.",
      "ja-JP": "セグメントコントロールのつまみで、クリックでもドラッグでも操作できます。位置はばねで計算するため、途中で向きを変えても今の位置から動き続けます。離したときの速さで止まる項目を決めます。端まで素早く動かすと、つまみがつぶれてから戻ります。つまみの下の文字は拡大して表示します。クリックではつまみが目標に着いた時点で、ドラッグでは離した時点で切り替わります。",
      "ko-KR": "분할 컨트롤의 손잡이로, 클릭하거나 끌 수 있습니다. 위치는 스프링으로 계산하므로 중간에 방향을 바꿔도 현재 위치에서 이어서 움직입니다. 놓을 때의 속도로 멈출 항목을 정합니다. 양 끝으로 빠르게 끌면 손잡이가 눌렸다가 되돌아옵니다. 손잡이 아래 글자는 확대해 보여 줍니다. 클릭하면 손잡이가 목표에 닿을 때, 끌면 놓을 때 전환됩니다.",
      "fr-FR": "Le curseur d'un contrôle segmenté, que l'on peut cliquer ou faire glisser. Un ressort calcule sa position : un changement de sens repart de l'endroit où il se trouve. Au relâchement, sa vitesse décide de l'option où il s'arrête. Tiré vite vers une extrémité, il s'écrase puis revient. Le texte sous le curseur est agrandi. Un clic change d'option quand le curseur atteint la cible ; un glissement change au relâchement.",
      "es-ES": "El deslizador de un control segmentado, que se puede pulsar o arrastrar. Un muelle calcula su posición, de modo que un cambio de dirección continúa desde donde está. Al soltarlo, su velocidad decide en qué opción se detiene. Si se arrastra rápido hacia un extremo, se aplasta y vuelve. El texto bajo el deslizador se muestra ampliado. Un clic cambia de opción cuando el deslizador llega al destino; un arrastre cambia al soltar.",
      "ru-RU": "Ползунок сегментного переключателя: на него можно нажать или перетащить. Положение рассчитывает пружина, поэтому при смене направления движение продолжается с текущего места. При отпускании скорость определяет, на каком варианте он остановится. При быстром движении к краю ползунок сплющивается и возвращается. Текст под ползунком увеличивается. При нажатии переключение происходит, когда ползунок доходит до цели, при перетаскивании в момент отпускания.",
    },
  },
  {
    id: "flip",
    code: "FLIP",
    name: { "zh-CN": "换位（FLIP）", "zh-TW": "換位（FLIP）", "en-US": "Reposition (FLIP)", "ja-JP": "位置の移動（FLIP）", "ko-KR": "위치 이동(FLIP)", "fr-FR": "Repositionnement (FLIP)", "es-ES": "Reubicación (FLIP)", "ru-RU": "Перемещение (FLIP)" },
    desc: {
      "zh-CN": "元素位置或尺寸变化时，先记录起点，再测量终点，然后从起点平滑过渡到终点。流动列表中的条目与页码均以此方式移动。",
      "zh-TW": "元素位置或尺寸變化時，先記錄起點，再測量終點，然後從起點平滑過渡到終點。流動列表中的條目與頁碼均以此方式移動。",
      "en-US": "When an element changes position or size, its start is recorded, its end is measured, and it then moves smoothly from start to end. Items in a flow list and page numbers move this way.",
      "ja-JP": "要素の位置や大きさが変わるとき、まず始点を記録し、終点を測ってから、始点から終点へ滑らかに移します。フローリストの項目とページ番号はこの方法で動きます。",
      "ko-KR": "요소의 위치나 크기가 바뀔 때 먼저 시작점을 기록하고 끝점을 잰 뒤 시작점에서 끝점으로 부드럽게 옮깁니다. 흐름 목록의 항목과 페이지 번호가 이 방식으로 움직입니다.",
      "fr-FR": "Quand un élément change de position ou de taille, son point de départ est noté, son point d'arrivée mesuré, puis il passe en douceur de l'un à l'autre. Les éléments de la liste fluide et les numéros de page se déplacent ainsi.",
      "es-ES": "Cuando un elemento cambia de posición o tamaño, se registra el punto de partida, se mide el de llegada y se pasa con suavidad de uno a otro. Los elementos de la lista fluida y los números de página se mueven así.",
      "ru-RU": "Когда элемент меняет положение или размер, сначала запоминается начальная точка, затем измеряется конечная, после чего элемент плавно переходит из одной в другую. Так движутся элементы плавного списка и номера страниц.",
    },
  },
  {
    id: "stagger",
    code: "stagger(), .rise",
    name: { "zh-CN": "依次浮现", "zh-TW": "依次浮現", "en-US": "Staggered rise", "ja-JP": "順に浮かぶ", "ko-KR": "차례로 떠오름", "fr-FR": "Apparition décalée", "es-ES": "Aparición escalonada", "ru-RU": "Поочерёдное появление" },
    desc: {
      "zh-CN": "一组内容仅在首次出现时依次浮现；切换条目、筛选或页码时不重复。",
      "zh-TW": "一組內容僅在首次出現時依次浮現；切換項目、篩選或頁碼時不重複。",
      "en-US": "Content rises in sequence only on first appearance, never on item, filter or page " +
        "changes.",
      "ja-JP": "内容が順に浮かぶのは初回表示だけで、項目・絞り込み・ページの変更では繰り返さない。",
      "ko-KR": "내용의 순차 등장은 처음 표시할 때만 쓰며 항목, 필터, 페이지 변경에서는 반복하지 않는다.",
      "fr-FR": "Le contenu apparaît en séquence uniquement au premier affichage, jamais au changement " +
        "d’élément, de filtre ou de page.",
      "es-ES": "El contenido aparece en secuencia solo al mostrarse por primera vez, nunca al cambiar de" +
        " elemento, filtro o página.",
      "ru-RU": "Содержимое появляется по очереди только при первом показе, без повтора при смене " +
        "элемента, фильтра или страницы.",
    },
  },
];
