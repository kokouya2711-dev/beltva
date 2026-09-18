// オンボーディングの「登録内容を確認」画面との行き来を管理するヘルパー
// 各ステップは ?from=confirm クエリパラメータで編集モードかどうかを判定する。

// 確認画面からの「変更」でステップを開くURLを生成
export function editStepUrl(step, returnTo) {
  const params = new URLSearchParams();
  params.set("from", "confirm");
  if (returnTo && returnTo !== "/") params.set("returnTo", returnTo);
  return `/onboarding/${step}?${params.toString()}`;
}

// 確認画面のURLを生成
export function confirmUrl(returnTo) {
  if (returnTo && returnTo !== "/") {
    return `/onboarding/confirm?returnTo=${encodeURIComponent(returnTo)}`;
  }
  return "/onboarding/confirm";
}

// 現在確認画面からの変更モードかどうか
export function isEditMode() {
  try {
    return new URLSearchParams(window.location.search).get("from") === "confirm";
  } catch {
    return false;
  }
}