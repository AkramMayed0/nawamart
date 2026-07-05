/**
 * Password strength validation and complexity rules.
 */

const MIN_LENGTH = 8;
const RULES = [
  {
    test: (pw) => pw.length >= MIN_LENGTH,
    message: `كلمة المرور يجب أن تكون ${MIN_LENGTH} أحرف على الأقل`,
  },
  {
    test: (pw) => /[a-z]/.test(pw),
    message: 'كلمة المرور يجب أن تحتوي على حرف صغير (a-z) على الأقل',
  },
  {
    test: (pw) => /[A-Z]/.test(pw),
    message: 'كلمة المرور يجب أن تحتوي على حرف كبير (A-Z) على الأقل',
  },
  {
    test: (pw) => /[0-9]/.test(pw),
    message: 'كلمة المرور يجب أن تحتوي على رقم (0-9) على الأقل',
  },
  {
    test: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw),
    message: 'كلمة المرور يجب أن تحتوي على رمز خاص على الأقل (!@#$%^&* etc.)',
  },
];

function validatePasswordStrength(password) {
  const errors = [];
  for (const rule of RULES) {
    if (!rule.test(password)) {
      errors.push(rule.message);
    }
  }
  return errors;
}

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: 'ضعيفة', color: 'bg-red-500' };
  let score = 0;
  if (password.length >= MIN_LENGTH) score += 20;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) score += 25;
  if (score >= 90) return { score, label: 'ممتازة', color: 'bg-green-500' };
  if (score >= 70) return { score, label: 'قوية', color: 'bg-green-400' };
  if (score >= 50) return { score, label: 'متوسطة', color: 'bg-yellow-500' };
  return { score, label: 'ضعيفة', color: 'bg-red-500' };
}

module.exports = { validatePasswordStrength, getPasswordStrength, MIN_LENGTH };
