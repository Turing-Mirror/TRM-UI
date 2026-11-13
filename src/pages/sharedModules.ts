import type { Text } from "./rules";

/**
 * Fabric 系列产品共用的代码。「共用代码」页照这份数据渲染。
 *
 * 只收几款产品里完全相同、又不依赖某一款产品自己的文案和接口的模块。
 * 源码在 src/trm/fabric/，从 trm-ui/fabric 引入。新增一条时八种语言写全。
 */
export type SharedModule = {
  id: string;
  /** 导出的名字。 */
  names: string[];
  /** 这个模块做什么。 */
  what: Text;
};

export const SHARED_FROM = "trm-ui/fabric";

export const SHARED_MODULES: SharedModule[] = [
  {
    id: "errorText",
    names: ["splitErrorText"],
    what: {
      "zh-CN": "把一长段报错拆成正文和详情：正文取最后一行真实报错，完整内容留作详情。",
      "zh-TW": "把一長段報錯拆成正文和詳情：正文取最後一行真實報錯，完整內容留作詳情。",
      "en-US": "Splits a long error into a summary and details: the summary is the last real error line, the full text stays as details.",
      "ja-JP": "長いエラーを本文と詳細に分ける。本文は最後の実際のエラー行、全文は詳細として残す。",
      "ko-KR": "긴 오류를 본문과 상세로 나눈다. 본문은 마지막 실제 오류 줄이고, 전체 내용은 상세로 남긴다.",
      "fr-FR": "Sépare une longue erreur en résumé et détails : le résumé est la dernière vraie ligne d’erreur, le texte complet reste en détails.",
      "es-ES": "Divide un error largo en resumen y detalles: el resumen es la última línea real del error y el texto completo queda como detalles.",
      "ru-RU": "Делит длинную ошибку на краткий текст и подробности: краткий текст — последняя настоящая строка ошибки, полный текст остаётся в подробностях.",
    },
  },
  {
    id: "shots",
    names: ["prepareShot", "imageFilesFrom", "base64Bytes", "MAX_SHOTS", "MAX_SHOT_BYTES"],
    what: {
      "zh-CN": "把粘贴或选中的截图压到能放进诊断包的大小，并限制张数。",
      "zh-TW": "把貼上或選取的截圖壓到能放進診斷包的大小，並限制張數。",
      "en-US": "Shrinks pasted or picked screenshots to fit a diagnostics bundle and caps how many are attached.",
      "ja-JP": "貼り付けた、または選んだスクリーンショットを診断パッケージに入る大きさに縮め、枚数を制限する。",
      "ko-KR": "붙여 넣거나 선택한 스크린샷을 진단 묶음에 들어갈 크기로 줄이고 장수를 제한한다.",
      "fr-FR": "Réduit les captures collées ou choisies pour qu’elles tiennent dans un paquet de diagnostic et en limite le nombre.",
      "es-ES": "Reduce las capturas pegadas o elegidas para que quepan en un paquete de diagnóstico y limita cuántas se adjuntan.",
      "ru-RU": "Сжимает вставленные или выбранные снимки экрана до размера диагностического пакета и ограничивает их число.",
    },
  },
  {
    id: "webDialog",
    names: ["askConfirm", "askPrompt", "registerDialogHandler"],
    what: {
      "zh-CN": "应用内居中的确认框和输入框的调用入口，代替浏览器自带的 confirm 和 prompt。",
      "zh-TW": "應用程式內置中的確認框和輸入框的呼叫入口，取代瀏覽器內建的 confirm 和 prompt。",
      "en-US": "Entry points for the centred in-app confirm and prompt dialogs, used in place of the browser’s confirm and prompt.",
      "ja-JP": "アプリ内の中央に出る確認ダイアログと入力ダイアログの呼び出し口。ブラウザー標準の confirm と prompt の代わりに使う。",
      "ko-KR": "앱 안 가운데에 뜨는 확인 창과 입력 창의 호출 진입점. 브라우저 기본 confirm과 prompt 대신 쓴다.",
      "fr-FR": "Points d’entrée des boîtes de confirmation et de saisie centrées dans l’application, à la place de confirm et prompt du navigateur.",
      "es-ES": "Puntos de entrada de los cuadros de confirmación y de entrada centrados en la aplicación, en lugar de confirm y prompt del navegador.",
      "ru-RU": "Точки вызова окон подтверждения и ввода по центру приложения вместо браузерных confirm и prompt.",
    },
  },
  {
    id: "nativeDialog",
    names: ["pickPath", "subscribeNativeDialogHint"],
    what: {
      "zh-CN": "打开系统的文件或文件夹选择框，并在它打开期间通知界面显示提示。",
      "zh-TW": "開啟系統的檔案或資料夾選擇框，並在它開啟期間通知介面顯示提示。",
      "en-US": "Opens the system file or folder picker and tells the interface to show a hint while it is open.",
      "ja-JP": "システムのファイルまたはフォルダー選択ダイアログを開き、開いている間は画面にヒントを出すよう通知する。",
      "ko-KR": "시스템의 파일 또는 폴더 선택 창을 열고, 열려 있는 동안 화면에 안내를 표시하도록 알린다.",
      "fr-FR": "Ouvre le sélecteur de fichier ou de dossier du système et demande à l’interface d’afficher une indication tant qu’il est ouvert.",
      "es-ES": "Abre el selector de archivos o carpetas del sistema y avisa a la interfaz para que muestre una indicación mientras está abierto.",
      "ru-RU": "Открывает системное окно выбора файла или папки и сообщает интерфейсу показать подсказку, пока оно открыто.",
    },
  },
  {
    id: "lifecycle",
    names: ["noteMount", "noteUnmount", "mountCounts", "resetMountCounts"],
    what: {
      "zh-CN": "记录组件装上和卸下的次数，测试用它核对反复切页后没有残留。",
      "zh-TW": "記錄元件裝上和卸下的次數，測試用它核對反覆切頁後沒有殘留。",
      "en-US": "Counts component mounts and unmounts; tests use it to confirm nothing is left behind after repeated page switches.",
      "ja-JP": "コンポーネントのマウントとアンマウントの回数を記録する。テストはこれで、ページを何度切り替えても残りがないことを確かめる。",
      "ko-KR": "컴포넌트가 올라가고 내려간 횟수를 기록한다. 테스트에서 페이지를 여러 번 바꾼 뒤 남은 것이 없는지 확인하는 데 쓴다.",
      "fr-FR": "Compte les montages et démontages des composants ; les tests s’en servent pour vérifier qu’il ne reste rien après de nombreux changements de page.",
      "es-ES": "Cuenta los montajes y desmontajes de componentes; las pruebas lo usan para comprobar que no queda nada tras cambiar de página muchas veces.",
      "ru-RU": "Считает монтирования и размонтирования компонентов; тесты проверяют по нему, что после многократной смены страниц ничего не остаётся.",
    },
  },
];
