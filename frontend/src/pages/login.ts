// ============================================================
//  pages/login.ts — вход, регистрация и быстрый демо-вход.
// ============================================================

export async function pageLogin(): Promise<string> {
  return (
  '<section class="section" style="max-width:480px;margin:0 auto">' +
    '<div class="card" style="padding:26px" data-reveal>' +
      '<div class="tabs">' +
        '<button class="tab-btn active" data-tab="login">Вход</button>' +
        '<button class="tab-btn" data-tab="register">Регистрация</button>' +
      '</div>' +
      '<div data-tab-panel="login">' +
        '<form class="stack" data-action="login-form">' +
          '<div><label>Email</label><input type="email" name="email" required placeholder="you@example.com"></div>' +
          '<div><label>Пароль</label><input type="password" name="password" required placeholder="••••••"></div>' +
          '<button class="btn btn-primary btn-block" type="submit">Войти</button>' +
        '</form>' +
      '</div>' +
      '<div data-tab-panel="register" hidden>' +
        '<form class="stack" data-action="register-form">' +
          '<div><label>ФИО</label><input name="fullName" required placeholder="Иванов Иван"></div>' +
          '<div><label>Email</label><input type="email" name="email" required></div>' +
          '<div><label>Пароль</label><input type="password" name="password" required minlength="6"></div>' +
          '<button class="btn btn-primary btn-block" type="submit">Создать аккаунт</button>' +
        '</form>' +
      '</div>' +
      '<p class="muted" style="margin:18px 0 10px;text-align:center">— или быстрый демо-вход —</p>' +
      '<div class="row" style="justify-content:center">' +
        '<button class="btn btn-ghost btn-sm" data-action="demo-login" data-role="passenger">Войти как пассажир</button>' +
        '<button class="btn btn-ghost btn-sm" data-action="demo-login" data-role="admin">Войти как администратор</button>' +
      '</div>' +
    '</div>' +
  '</section>'
  );
}
