import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { resolveUploadUrl } from "./uploadUrl";

const API_BASE_URL = "http://localhost:5000/api/profiles";
const SKILL_FIELDS = ["frontendSkills", "backendSkills", "databaseSkills"];

const normalizeSkillArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const normalizeStudentProfile = (profile) => {
  if (!profile) return profile;

  const normalized = { ...profile };
  SKILL_FIELDS.forEach((field) => {
    normalized[field] = normalizeSkillArray(profile[field]);
  });

  return normalized;
};

function S_Profile() {
  const [student, setStudent] = useState({});
  const [cvFile, setCvFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const storedProfile = JSON.parse(localStorage.getItem("student"));
      const account = JSON.parse(localStorage.getItem("studentAccount")) || storedProfile;

      if (!account) return;

      const isProfileRecord = storedProfile && !storedProfile.password && !storedProfile.address;
      if (isProfileRecord) {
        setStudent(normalizeStudentProfile(storedProfile));
        return;
      }

      const { _id, password, ...accountFields } = account;

      try {
        const res = await axios.get(`${API_BASE_URL}/email/${encodeURIComponent(account.email)}`);
        const normalizedProfile = normalizeStudentProfile(res.data);
        setStudent(normalizedProfile);
        localStorage.setItem("student", JSON.stringify(normalizedProfile));
      } catch (err) {
        if (err.response?.status === 404) {
          setStudent(normalizeStudentProfile({ ...accountFields, accountId: _id }));
        } else {
          console.error("Failed to load profile", err);
          setStudent(normalizeStudentProfile({ ...accountFields, accountId: _id }));
        }
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStudent({ ...student, profileImage: file });
  };

  const handleCvChange = (e) => {
    setCvFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      Object.keys(student).forEach((key) => {
        if (["frontendSkills", "backendSkills", "databaseSkills"].includes(key)) {
          const val = student[key];
          if (Array.isArray(val)) formData.append(key, JSON.stringify(val));
          else if (typeof val === "string") formData.append(key, val);
        } else if (key === "profileImage" && student[key] instanceof File) {
          formData.append("profileImage", student[key]);
        } else if (key !== "profileImage") {
          if (student[key] !== undefined && student[key] !== null) {
            formData.append(key, student[key]);
          }
        }
      });

      if (cvFile) formData.append("cv", cvFile);

      const isUpdate = Boolean(student._id && !student.password && !student.address);
      const url = isUpdate
        ? `${API_BASE_URL}/update/${student._id}`
        : `${API_BASE_URL}/create`;
      const method = isUpdate ? axios.put : axios.post;

      const res = await method(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const savedProfileRes = await axios.get(`${API_BASE_URL}/${res.data._id}`);
      const normalizedProfile = normalizeStudentProfile(savedProfileRes.data);
      setStudent(normalizedProfile);
      localStorage.setItem("student", JSON.stringify(normalizedProfile));

      alert(isUpdate ? "Profile Updated ✅" : "Profile Created ✅");
      navigate("/student/dashboard");
    } catch (err) {
      console.error(
        "Profile save failed",
        err.response?.status,
        err.response?.data || err.message
      );
      alert(`Failed ❌ ${err.response?.data?.message || err.message}`);
    }
  };

  const provinces = [
    "Central",
    "Eastern",
    "North Central",
    "Northern",
    "North Western",
    "Sabaragamuwa",
    "Southern",
    "Uva",
    "Western"
  ];

  const districts = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
    "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya",
    "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
  ];

  const frontendLanguages = [
    "HTML", "CSS", "JavaScript", "TypeScript", "React", "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js", "Ember.js", "Backbone.js"
  ];

  const backendLanguages = [
    "Node.js", "Java", "Python", "PHP", "C#", "Ruby", "Go", "Rust", "Kotlin", "Swift", "Scala", "Perl", "Elixir", "Dart"
  ];

  const databaseSkills = [
    "MySQL", "MongoDB", "PostgreSQL", "SQLite", "Redis", "Oracle", "SQL Server", "Cassandra", "DynamoDB", "Firebase", "CouchDB"
  ];

  const sectionCardClass = "rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(99,102,241,0.14)] backdrop-blur";
  const inputClass = "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition duration-200 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";
  const sectionTitleClass = "text-lg font-bold text-slate-900";
  const sectionHintClass = "mt-1 text-sm text-slate-500";
  const skillChipClass = (isActive) => `flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition duration-200 ${
    isActive
      ? "border-primary bg-primary/10 text-primary shadow-sm"
      : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:bg-primary/5"
  }`;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(6,182,212,0.18),_transparent_24%),linear-gradient(180deg,_#eef2ff_0%,_#f8fafc_42%,_#f8fafc_100%)]">
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-secondary to-accent">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.18),transparent_40%,rgba(255,255,255,0.08))]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">
              Student Profile
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
              Build a profile that feels complete
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 md:text-base">
              Add your education, skills, CV, and personal details in a cleaner layout using your main theme colors.
            </p>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-5 text-white shadow-lg backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.22em] text-white/70">Profile status</p>
            <p className="mt-2 text-2xl font-bold">
              {student._id ? "Ready to update" : "Create profile"}
            </p>
            <p className="mt-2 text-sm text-white/80">
              Keep your CV and profile image polished before companies view them.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-10 max-w-6xl px-4 pb-12 sm:px-6">
        <div className={`${sectionCardClass} mb-6 p-6 md:p-8`}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div
                className="group relative h-28 w-28 overflow-hidden rounded-[2rem] border-4 border-white bg-slate-100 shadow-[0_18px_50px_rgba(99,102,241,0.2)] cursor-pointer"
                onClick={() => document.getElementById("profileInput").click()}
              >
                <img
                  src={
                    student.profileImage instanceof File
                      ? URL.createObjectURL(student.profileImage)
                      : student.profileImage ? resolveUploadUrl(student.profileImage) : "/placeholder-profile.png"
                  }
                  alt="profile"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/70 to-transparent px-3 py-2 text-center text-xs font-semibold text-white opacity-100 md:opacity-0 md:transition md:duration-200 md:group-hover:opacity-100">
                  Change photo
                </div>
                <input
                  type="file"
                  id="profileInput"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              <div>
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Student Identity
                </span>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                  {student.firstName || "Your"} {student.lastName || "Profile"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {student.email || "Add your account details and present them clearly."}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Profile image</p>
                <p className="mt-1 text-sm text-slate-600">
                  Use a clear professional photo.
                </p>
              </div>
              <div className="rounded-2xl border border-accent/10 bg-accent/5 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">CV upload</p>
                <p className="mt-1 text-sm text-slate-600">
                  Keep your latest resume attached.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className={sectionCardClass}>
            <div className="mb-6">
              <h3 className={sectionTitleClass}>Basic Info</h3>
              <p className={sectionHintClass}>Present your contact and location details clearly.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Province</label>
                <select
                  name="province"
                  value={student.province || ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Province</option>
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>District</label>
                <select
                  name="district"
                  value={student.district || ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select District</option>
                  {districts.map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Phone Number</label>
                <input
                  name="contactNumber"
                  placeholder="Enter your contact number"
                  value={student.contactNumber || ""}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className={sectionCardClass}>
            <div className="mb-6">
              <h3 className={sectionTitleClass}>School Education</h3>
              <p className={sectionHintClass}>Add your school background and A/L stream.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>School</label>
                <input
                  name="school"
                  placeholder="Enter your school"
                  value={student.school || ""}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>A/L Stream</label>
                <select
                  name="localStream"
                  value={student.localStream || ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select A/L Stream</option>
                  <option>Physical Science</option>
                  <option>Biological Science</option>
                  <option>Commerce</option>
                  <option>Arts</option>
                </select>
              </div>
            </div>
          </section>

          <section className={`${sectionCardClass} lg:col-span-2`}>
            <div className="mb-6">
              <h3 className={sectionTitleClass}>University</h3>
              <p className={sectionHintClass}>Highlight your current academic level and degree path.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className={labelClass}>Level</label>
                <select
                  name="eduLevel"
                  value={student.eduLevel || ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Level</option>
                  <option>Undergraduate</option>
                  <option>Graduate</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>University</label>
                <input
                  name="university"
                  placeholder="Enter your university"
                  value={student.university || ""}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Degree</label>
                <input
                  name="degree"
                  placeholder="Enter your degree"
                  value={student.degree || ""}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className={`${sectionCardClass} lg:col-span-2`}>
            <div className="mb-6">
              <h3 className={sectionTitleClass}>Technical Skills</h3>
              <p className={sectionHintClass}>Choose the areas you want employers to notice first.</p>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Frontend Languages</h4>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {frontendLanguages.map((skill) => (
                    <label key={skill} className={skillChipClass(student.frontendSkills?.includes(skill) || false)}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                        checked={student.frontendSkills?.includes(skill) || false}
                        onChange={(e) => {
                          let updated = [...(student.frontendSkills || [])];
                          if (e.target.checked && !updated.includes(skill)) updated.push(skill);
                          else updated = updated.filter((s) => s !== skill);
                          setStudent({ ...student, frontendSkills: updated });
                        }}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">Backend Languages</h4>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {backendLanguages.map((skill) => (
                    <label key={skill} className={skillChipClass(student.backendSkills?.includes(skill) || false)}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                        checked={student.backendSkills?.includes(skill) || false}
                        onChange={(e) => {
                          let updated = [...(student.backendSkills || [])];
                          if (e.target.checked && !updated.includes(skill)) updated.push(skill);
                          else updated = updated.filter((s) => s !== skill);
                          setStudent({ ...student, backendSkills: updated });
                        }}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-accent">Database Skills</h4>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {databaseSkills.map((skill) => (
                    <label key={skill} className={skillChipClass(student.databaseSkills?.includes(skill) || false)}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                        checked={student.databaseSkills?.includes(skill) || false}
                        onChange={(e) => {
                          let updated = [...(student.databaseSkills || [])];
                          if (e.target.checked && !updated.includes(skill)) updated.push(skill);
                          else updated = updated.filter((s) => s !== skill);
                          setStudent({ ...student, databaseSkills: updated });
                        }}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Preferred Field</label>
                <select
                  name="preferredField"
                  value={student.preferredField || ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Preferred Area</option>
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>Full Stack Developer</option>
                  <option>Mobile App Developer</option>
                  <option>QA Engineer</option>
                  <option>Software Tester</option>
                  <option>Automation Tester</option>
                  <option>DevOps Engineer</option>
                  <option>Cloud Engineer</option>
                  <option>System Administrator</option>
                  <option>Data Analyst</option>
                  <option>Data Scientist</option>
                  <option>Machine Learning Engineer</option>
                  <option>UI/UX Designer</option>
                  <option>Project Manager</option>
                  <option>Product Manager</option>
                  <option>Business Analyst</option>
                  <option>Cybersecurity Analyst</option>
                </select>
              </div>
            </div>
          </section>

          <section className={sectionCardClass}>
            <div className="mb-6">
              <h3 className={sectionTitleClass}>Extra Details</h3>
              <p className={sectionHintClass}>Add achievements and a short professional summary.</p>
            </div>
            <div className="grid gap-5">
              <div>
                <label className={labelClass}>Leadership</label>
                <input
                  name="leadership"
                  placeholder="Leadership roles or experience"
                  value={student.leadership || ""}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Awards</label>
                <input
                  name="awards"
                  placeholder="Awards and recognitions"
                  value={student.awards || ""}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>About Me</label>
                <textarea
                  name="bio"
                  placeholder="Write a short summary about yourself"
                  value={student.bio || ""}
                  onChange={handleChange}
                  rows={5}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </section>

          <section className={sectionCardClass}>
            <div className="mb-6">
              <h3 className={sectionTitleClass}>CV & Attachments</h3>
              <p className={sectionHintClass}>Upload your latest CV and keep it easy to access.</p>
            </div>
            <div className="space-y-5">
              <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5">
                <label className={labelClass}>Upload CV</label>
                <input
                  type="file"
                  onChange={handleCvChange}
                  className={`${inputClass} file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-secondary`}
                />
                <p className="mt-3 text-sm text-slate-500">
                  PDF format is recommended for better viewing.
                </p>
              </div>

              {student.cv && !cvFile && (
                <a
                  href={resolveUploadUrl(student.cv)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-accent/20 bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(6,182,212,0.25)] transition duration-200 hover:-translate-y-0.5 hover:bg-cyan-500"
                >
                  View Current CV
                </a>
              )}
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-end">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:border-primary/30 hover:text-primary"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent px-8 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(99,102,241,0.32)] transition duration-200 hover:-translate-y-0.5"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default S_Profile;
