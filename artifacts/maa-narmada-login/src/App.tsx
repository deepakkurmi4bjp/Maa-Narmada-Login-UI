import { type FormEvent, type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  getListRegistrationsQueryKey,
  useCreateRegistration,
  useDeleteRegistration,
  useListRegistrations,
  useUpdateRegistration,
  type Registration,
  type RegistrationInput,
} from '@workspace/api-client-react';
import {
  Check,
  ChevronDown,
  FileText,
  Mars,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
  UsersRound,
  Venus,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type RegistrationForm = {
  name: string;
  fatherName: string;
  motherName: string;
  age: string;
  gender: 'Male' | 'Female' | '';
  mobile: string;
  whatsapp: string;
  village: string;
  block: string;
  district: string;
  allergy: string;
};

type Companion = {
  name: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  relation: string;
};

const initialRegistration: RegistrationForm = {
  name: '',
  fatherName: '',
  motherName: '',
  age: '',
  gender: '',
  mobile: '',
  whatsapp: '',
  village: '',
  block: '',
  district: '',
  allergy: '',
};

const initialCompanion: Companion = {
  name: '',
  age: '',
  gender: '',
  relation: '',
};

const emptyRegistrationInput: RegistrationInput = {
  name: '',
  fatherName: '',
  motherName: '',
  age: '',
  gender: 'Male',
  mobile: '',
  whatsapp: '',
  village: '',
  block: '',
  district: '',
  allergy: '',
  companions: [],
};

function registrationToInput(registration: Registration): RegistrationInput {
  return {
    name: registration.name,
    fatherName: registration.fatherName,
    motherName: registration.motherName,
    age: registration.age,
    gender: registration.gender,
    mobile: registration.mobile,
    whatsapp: registration.whatsapp,
    village: registration.village,
    block: registration.block,
    district: registration.district,
    allergy: registration.allergy,
    companions: registration.companions.slice(0, 10),
  };
}

function AdminManager() {
  const queryClient = useQueryClient();
  const { data: registrations, isLoading, isError } = useListRegistrations();
  const updateMutation = useUpdateRegistration();
  const deleteMutation = useDeleteRegistration();
  const createMutation = useCreateRegistration();
  const [draft, setDraft] = useState<RegistrationInput | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [managerError, setManagerError] = useState('');
  const [managerMessage, setManagerMessage] = useState('');

  function invalidateRegistrations() {
    void queryClient.invalidateQueries({ queryKey: getListRegistrationsQueryKey() });
  }

  function startNew() {
    setEditingId(null);
    setDraft({ ...emptyRegistrationInput });
    setManagerError('');
    setManagerMessage('');
  }

  function startEdit(registration: Registration) {
    setEditingId(registration.id);
    setDraft(registrationToInput(registration));
    setManagerError('');
    setManagerMessage('');
  }

  function updateDraft(key: keyof RegistrationInput, value: string) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  }

  function updateDraftCompanion(index: number, key: keyof Companion, value: string) {
    setDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        companions: current.companions.map((companion, companionIndex) =>
          companionIndex === index ? { ...companion, [key]: value } : companion,
        ),
      };
    });
  }

  function addDraftCompanion() {
    setDraft((current) => current && current.companions.length < 10
      ? { ...current, companions: [...current.companions, { ...initialCompanion }] }
      : current);
  }

  function removeDraftCompanion(index: number) {
    setDraft((current) => current
      ? { ...current, companions: current.companions.filter((_, companionIndex) => companionIndex !== index) }
      : current);
  }

  function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    setManagerError('');
    setManagerMessage('');
    const onSuccess = () => {
      invalidateRegistrations();
      setDraft(null);
      setEditingId(null);
      setManagerMessage(editingId ? 'Registration updated successfully.' : 'Registration added successfully.');
    };
    const onError = () => setManagerError('Registration save नहीं हो सका। कृपया विवरण जाँचें और फिर प्रयास करें।');
    if (editingId === null) {
      createMutation.mutate({ data: draft }, { onSuccess, onError });
    } else {
      updateMutation.mutate({ id: editingId, data: draft }, { onSuccess, onError });
    }
  }

  function removeRegistration(id: number) {
    if (!window.confirm('क्या आप यह registration हटाना चाहते हैं?')) return;
    setManagerError('');
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        invalidateRegistrations();
        setManagerMessage('Registration removed successfully.');
      },
      onError: () => setManagerError('Registration हटाया नहीं जा सका।'),
    });
  }

  return (
    <section className="registration-manager" aria-labelledby="registration-manager-heading">
      <div className="manager-heading">
        <div>
          <h3 id="registration-manager-heading">सभी यात्रा पंजीयन</h3>
          <p>Admin registration जोड़, edit और remove कर सकता है। अधिकतम 10 companions।</p>
        </div>
        <button className="manager-add" type="button" onClick={startNew} data-testid="button-admin-add-registration">
          <Plus size={16} /> Add Registration
        </button>
      </div>

      {managerError && <p className="admin-error" role="alert" data-testid="error-registration-manager">{managerError}</p>}
      {managerMessage && <p className="manager-message" role="status">{managerMessage}</p>}

      {draft && (
        <form className="manager-editor" onSubmit={saveDraft}>
          <div className="manager-editor-heading">
            <strong>{editingId === null ? 'नया registration' : 'Registration edit करें'}</strong>
            <button type="button" className="manager-cancel" onClick={() => setDraft(null)}>Cancel</button>
          </div>
          <div className="form-grid">
            {([
              ['name', 'Name'],
              ['fatherName', "Father's Name"],
              ['motherName', "Mother's Name"],
              ['age', 'Age'],
              ['mobile', 'Mobile Number'],
              ['whatsapp', 'WhatsApp Number'],
              ['village', 'Village'],
              ['block', 'Block'],
              ['district', 'District'],
              ['allergy', 'Disease / Allergy'],
            ] as const).map(([key, label]) => (
              <Field
                key={key}
                label={label}
                value={draft[key]}
                onChange={(value) => updateDraft(key, value)}
                placeholder={label}
                testId={`input-admin-${key}`}
                required={key !== 'allergy'}
              />
            ))}
            <label className="field">
              <span>Gender</span>
              <select
                className="field-input"
                value={draft.gender}
                onChange={(event) => updateDraft('gender', event.target.value)}
                data-testid="select-admin-gender"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
          </div>
          <div className="manager-companions">
            <div className="manager-subheading">
              <strong>Companions ({draft.companions.length}/10)</strong>
              <button type="button" className="manager-add-small" onClick={addDraftCompanion} disabled={draft.companions.length >= 10}>
                <Plus size={14} /> Add companion
              </button>
            </div>
            {draft.companions.map((companion, index) => (
              <div className="manager-companion-row" key={`admin-companion-${index}`}>
                <input className="field-input" value={companion.name} onChange={(event) => updateDraftCompanion(index, 'name', event.target.value)} placeholder="Name" aria-label={`Admin companion ${index + 1} name`} />
                <input className="field-input" value={companion.age} onChange={(event) => updateDraftCompanion(index, 'age', event.target.value)} placeholder="Age" aria-label={`Admin companion ${index + 1} age`} />
                <select className="field-input" value={companion.gender} onChange={(event) => updateDraftCompanion(index, 'gender', event.target.value)} aria-label={`Admin companion ${index + 1} gender`}>
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input className="field-input" value={companion.relation} onChange={(event) => updateDraftCompanion(index, 'relation', event.target.value)} placeholder="Relation" aria-label={`Admin companion ${index + 1} relation`} />
                <button type="button" className="remove-companion" onClick={() => removeDraftCompanion(index)} aria-label={`Remove admin companion ${index + 1}`}>
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
          <button className="admin-save" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? 'Saving…' : 'Save Registration'}
          </button>
        </form>
      )}

      {isLoading && <p className="manager-empty">Registrations load हो रहे हैं…</p>}
      {isError && <p className="admin-error" role="alert">Registrations load नहीं हो सके।</p>}
      {!isLoading && !isError && !registrations?.length && <p className="manager-empty">अभी कोई registration उपलब्ध नहीं है।</p>}
      {!!registrations?.length && (
        <div className="registration-table-wrap">
          <table className="registration-table">
            <thead>
              <tr><th>Name</th><th>Mobile</th><th>Location</th><th>Companions</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {registrations.map((registration) => (
                <tr key={registration.id}>
                  <td><strong>{registration.name}</strong><small>{registration.fatherName}</small></td>
                  <td>{registration.mobile}</td>
                  <td>{registration.village}, {registration.district}</td>
                  <td>{registration.companions.length}/10</td>
                  <td className="manager-actions">
                    <button type="button" className="manager-edit" onClick={() => startEdit(registration)} data-testid={`button-edit-registration-${registration.id}`}>Edit</button>
                    <button type="button" className="manager-delete" onClick={() => removeRegistration(registration.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-registration-${registration.id}`}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  hindiLabel,
  value,
  onChange,
  placeholder,
  testId,
  type = 'text',
  required = false,
  invalid = false,
}: {
  label: string;
  hindiLabel?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  testId: string;
  type?: string;
  required?: boolean;
  invalid?: boolean;
}) {
  return (
    <label className="field">
      <span>
        {label}{hindiLabel ? ` (${hindiLabel})` : ''}{required && <b className="required"> *</b>}
      </span>
      <input
        className="field-input"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        aria-invalid={invalid}
        data-testid={testId}
      />
    </label>
  );
}

function RegistrationPage() {
  const queryClient = useQueryClient();
  const createRegistrationMutation = useCreateRegistration();
  const [registration, setRegistration] = useState<RegistrationForm>(initialRegistration);
  const [sameWhatsApp, setSameWhatsApp] = useState(false);
  const [hasCompanions, setHasCompanions] = useState(true);
  const [companions, setCompanions] = useState<Companion[]>([initialCompanion]);
  const [registrationError, setRegistrationError] = useState('');
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminSignedIn, setAdminSignedIn] = useState(false);

  function updateRegistration(key: keyof RegistrationForm, value: string) {
    setRegistration((current) => ({ ...current, [key]: value }));
    setRegistrationError('');
    setRegistrationComplete(false);
  }

  function updateMobile(value: string) {
    setRegistration((current) => ({
      ...current,
      mobile: value,
      whatsapp: sameWhatsApp ? value : current.whatsapp,
    }));
    setRegistrationError('');
    setRegistrationComplete(false);
  }

  function toggleSameWhatsApp(checked: boolean) {
    setSameWhatsApp(checked);
    if (checked) {
      setRegistration((current) => ({ ...current, whatsapp: current.mobile }));
    }
  }

  function updateCompanion(index: number, key: keyof Companion, value: string) {
    setCompanions((current) =>
      current.map((companion, companionIndex) =>
        companionIndex === index ? { ...companion, [key]: value } : companion,
      ),
    );
  }

  function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const requiredValues = [
      registration.name,
      registration.fatherName,
      registration.motherName,
      registration.age,
      registration.gender,
      registration.mobile,
      registration.whatsapp,
      registration.village,
      registration.block,
      registration.district,
    ];
    if (requiredValues.some((value) => !value.trim())) {
      setRegistrationComplete(false);
      setRegistrationError('कृपया सभी आवश्यक विवरण भरें और लिंग का चयन करें।');
      return;
    }
    setRegistrationError('');
    const payload: RegistrationInput = {
      ...registration,
      gender: registration.gender as RegistrationInput['gender'],
      companions: hasCompanions
        ? companions.slice(0, 10).map((companion) => ({
          ...companion,
          gender: companion.gender as 'Male' | 'Female' | 'Other' | '',
        }))
        : [],
    };
    createRegistrationMutation.mutate(
      { data: payload },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: getListRegistrationsQueryKey() });
          setRegistrationComplete(true);
        },
        onError: () => {
          setRegistrationComplete(false);
          setRegistrationError('पंजीयन सुरक्षित नहीं हो सका। कृपया कुछ देर बाद फिर प्रयास करें।');
        },
      },
    );
  }

  function submitAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setAdminSignedIn(false);
      setAdminError('कृपया ईमेल और पासवर्ड भरें।');
      return;
    }
    if (adminEmail.trim().toLowerCase() !== 'deepak53802@gmail.com' || adminPassword !== 'Aditya@123') {
      setAdminSignedIn(false);
      setAdminError('ईमेल या पासवर्ड सही नहीं है। कृपया दोबारा प्रयास करें।');
      return;
    }
    setAdminError('');
    setAdminSignedIn(true);
  }

  return (
    <main className="login-page" data-testid="page-login">
      <div className="public-shell">
        <header className="hero-art" aria-label="श्री माँ नर्मदा भक्त परिवार">
          <div className="hero-caption">
            <span>॥ नर्मदे हर ॥</span>
            <span>श्री माँ नर्मदा भक्त परिवार</span>
          </div>
        </header>

        <section className="form-card" aria-labelledby="registration-heading" data-testid="card-registration">
          <div className="form-heading">
            <span className="heading-mark" aria-hidden="true"><FileText /></span>
            <div>
              <h1 id="registration-heading">यात्रा पंजीयन फॉर्म</h1>
              <p>श्री माँ नर्मदा जन्मोत्सव चुनरी यात्रा में सहभागी बनने हेतु अपना विवरण भरें</p>
            </div>
          </div>

          <form className="registration-form" noValidate onSubmit={submitRegistration}>
            <div className="form-grid">
              <Field
                label="Name"
                value={registration.name}
                onChange={(value) => updateRegistration('name', value)}
                placeholder="अपना पूरा नाम लिखें"
                testId="input-name"
                required
                invalid={!!registrationError && !registration.name}
              />
              <Field
                label="Father's Name"
                value={registration.fatherName}
                onChange={(value) => updateRegistration('fatherName', value)}
                placeholder="पिता का नाम लिखें"
                testId="input-father-name"
                required
                invalid={!!registrationError && !registration.fatherName}
              />
              <Field
                label="Mother's Name"
                value={registration.motherName}
                onChange={(value) => updateRegistration('motherName', value)}
                placeholder="माता का नाम लिखें"
                testId="input-mother-name"
                required
                invalid={!!registrationError && !registration.motherName}
              />
              <Field
                label="Age"
                hindiLabel="आयु (वर्ष में)"
                value={registration.age}
                onChange={(value) => updateRegistration('age', value)}
                placeholder="आयु (वर्ष में)"
                testId="input-age"
                type="number"
                required
                invalid={!!registrationError && !registration.age}
              />
            </div>

            <div className="field full-span">
              <span>Gender (लिंग)<b className="required"> *</b></span>
              <div className="gender-box" role="radiogroup" aria-label="Gender">
                <label className={`gender-choice${registration.gender === 'Male' ? ' selected' : ''}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={registration.gender === 'Male'}
                    onChange={() => updateRegistration('gender', 'Male')}
                    data-testid="radio-gender-male"
                  />
                  <Mars aria-hidden="true" /> <span>Male</span>
                </label>
                <label className={`gender-choice${registration.gender === 'Female' ? ' selected' : ''}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={registration.gender === 'Female'}
                    onChange={() => updateRegistration('gender', 'Female')}
                    data-testid="radio-gender-female"
                  />
                  <Venus aria-hidden="true" /> <span>Female</span>
                </label>
              </div>
            </div>

            <div className="contact-grid">
              <Field
                label="Mobile Number"
                value={registration.mobile}
                onChange={updateMobile}
                placeholder="मोबाइल नंबर लिखें"
                testId="input-mobile"
                type="tel"
                required
                invalid={!!registrationError && !registration.mobile}
              />
              <label className="same-number">
                <input
                  type="checkbox"
                  checked={sameWhatsApp}
                  onChange={(event) => toggleSameWhatsApp(event.target.checked)}
                  data-testid="checkbox-whatsapp-same"
                />
                <span>Is your WhatsApp number and mobile number the same?<br /><small>क्या आपका व्हाट्सऐप नंबर और मोबाइल नंबर एक ही है?</small></span>
              </label>
            </div>

            <div className="form-grid">
              <Field
                label="WhatsApp Number"
                value={registration.whatsapp}
                onChange={(value) => updateRegistration('whatsapp', value)}
                placeholder="व्हाट्सऐप नंबर लिखें"
                testId="input-whatsapp"
                type="tel"
                required
                invalid={!!registrationError && !registration.whatsapp}
              />
              <div aria-hidden="true" />
              <Field
                label="Village"
                hindiLabel="ग्राम"
                value={registration.village}
                onChange={(value) => updateRegistration('village', value)}
                placeholder="ग्राम का नाम लिखें"
                testId="input-village"
                required
                invalid={!!registrationError && !registration.village}
              />
              <Field
                label="Block"
                hindiLabel="ब्लॉक"
                value={registration.block}
                onChange={(value) => updateRegistration('block', value)}
                placeholder="ब्लॉक का नाम लिखें"
                testId="input-block"
                required
                invalid={!!registrationError && !registration.block}
              />
              <Field
                label="District"
                hindiLabel="जिला"
                value={registration.district}
                onChange={(value) => updateRegistration('district', value)}
                placeholder="जिले का नाम लिखें"
                testId="input-district"
                required
                invalid={!!registrationError && !registration.district}
              />
              <Field
                label="Any Disease / Allergy"
                hindiLabel="यदि कोई बीमारी / एलर्जी हो तो लिखें"
                value={registration.allergy}
                onChange={(value) => updateRegistration('allergy', value)}
                placeholder="यदि नहीं है तो N/A लिखें"
                testId="input-allergy"
              />
            </div>

            <section className="companion-panel" aria-labelledby="companion-heading">
              <div className="companions-header">
                <div>
                  <div className="companions-title" id="companion-heading"><UsersRound size={20} /> Are there any other companions coming with you?</div>
                  <p className="companions-subtitle">क्या आपके साथ और भी कोई साथी आ रहे हैं?</p>
                </div>
                <label className="companions-check">
                  <input
                    type="checkbox"
                    checked={hasCompanions}
                    onChange={(event) => setHasCompanions(event.target.checked)}
                    data-testid="checkbox-has-companions"
                  />
                  <span>Yes<br /><small>हाँ, साथी मेरे साथ आ रहे हैं</small></span>
                </label>
              </div>

              {hasCompanions && (
                <>
                  <div className="companion-list">
                    {companions.map((companion, index) => (
                      <div className="companion-row" key={`companion-${index}`}>
                        <Field
                          label="Name (नाम)"
                          value={companion.name}
                          onChange={(value) => updateCompanion(index, 'name', value)}
                          placeholder="नाम"
                          testId={`input-companion-name-${index}`}
                        />
                        <Field
                          label="Age (आयु)"
                          value={companion.age}
                          onChange={(value) => updateCompanion(index, 'age', value)}
                          placeholder="आयु"
                          testId={`input-companion-age-${index}`}
                          type="number"
                        />
                        <label className="field">
                          <span>Gender (लिंग)</span>
                          <select
                            className="field-input"
                            value={companion.gender}
                            onChange={(event) => updateCompanion(index, 'gender', event.target.value)}
                            aria-label={`Companion ${index + 1} gender`}
                            data-testid={`select-companion-gender-${index}`}
                          >
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </label>
                        <Field
                          label="Relation (संबंध)"
                          value={companion.relation}
                          onChange={(value) => updateCompanion(index, 'relation', value)}
                          placeholder="जैसे - मित्र, परिवार"
                          testId={`input-companion-relation-${index}`}
                        />
                        <button
                          className="remove-companion"
                          type="button"
                          onClick={() => setCompanions((current) => current.filter((_, companionIndex) => companionIndex !== index))}
                          disabled={companions.length === 1}
                          aria-label={`Remove companion ${index + 1}`}
                          data-testid={`button-remove-companion-${index}`}
                        >
                          <Trash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                   <button
                    type="button"
                    className="add-companion"
                    onClick={() => setCompanions((current) => [...current, { ...initialCompanion }])}
                     disabled={companions.length >= 10}
                    data-testid="button-add-companion"
                  >
                     <Plus /> {companions.length >= 10 ? 'Maximum 10 Companions' : 'Add Another Companion'}
                  </button>
                </>
              )}
            </section>

            {registrationError && <p className="form-error" role="alert" data-testid="error-registration">{registrationError}</p>}
            {registrationComplete && (
              <div className="registration-success" role="status" data-testid="status-registration-success">
                <Check size={20} />
                <div><strong>पंजीयन सफल रहा।</strong><span>आपकी यात्रा पंजीयन जानकारी सुरक्षित रूप से दर्ज हो गई है।</span></div>
              </div>
            )}
            <button className="submit-registration" type="submit" disabled={createRegistrationMutation.isPending} data-testid="button-submit-registration">
              <Send /> {createRegistrationMutation.isPending ? 'Saving Registration…' : 'Submit Registration'}
            </button>
          </form>
        </section>

        <div className="devotional-footer">माँ नर्मदा का आशीर्वाद, सदैव आपके साथ</div>
      </div>

      <section className="admin-shell" aria-labelledby="admin-heading">
        <button
          className="admin-toggle"
          type="button"
          aria-expanded={adminOpen}
          onClick={() => setAdminOpen((open) => !open)}
          data-testid="button-toggle-admin"
        >
          <span className="admin-toggle-label"><ShieldCheck /> <span>Admin Panel Login <small>प्रशासक प्रवेश</small></span></span>
          <ChevronDown aria-hidden="true" />
        </button>

        {adminOpen && (
          <div className="admin-panel">
            {!adminSignedIn ? (
              <>
                <h2 id="admin-heading">एडमिन पैनल लॉगिन</h2>
                <p>यात्रा पंजीयन की देखरेख के लिए अधिकृत प्रवेश</p>
                <form className="admin-form" onSubmit={submitAdmin} noValidate>
                  <label className="field">
                    <span>Email Address <b className="required">*</b></span>
                    <span className="sr-only">ईमेल पता</span>
                    <input
                      className="field-input"
                      type="email"
                      value={adminEmail}
                      onChange={(event) => { setAdminEmail(event.target.value); setAdminError(''); }}
                      placeholder="ईमेल पता दर्ज करें"
                      autoComplete="username"
                      required
                      aria-label="ईमेल पता"
                      data-testid="input-admin-email"
                    />
                  </label>
                  <label className="field">
                    <span>Password <b className="required">*</b></span>
                    <span className="sr-only">पासवर्ड</span>
                    <input
                      className="field-input"
                      type="password"
                      value={adminPassword}
                      onChange={(event) => { setAdminPassword(event.target.value); setAdminError(''); }}
                      placeholder="पासवर्ड दर्ज करें"
                      autoComplete="current-password"
                      required
                      aria-label="पासवर्ड"
                      data-testid="input-admin-password"
                    />
                  </label>
                  {adminError && <p className="admin-error" role="alert" data-testid="error-admin-login">{adminError}</p>}
                  <button className="admin-submit" type="submit" data-testid="button-admin-login">लॉगिन करें</button>
                </form>
              </>
            ) : (
                <>
                  <div className="admin-success" role="status" data-testid="status-admin-success">
                    <Check size={21} />
                    <span><strong>एडमिन लॉगिन सफल रहा।</strong><br />आप पंजीयन प्रबंधन के लिए अधिकृत हैं।</span>
                  </div>
                  <AdminManager />
                </>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={RegistrationPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;