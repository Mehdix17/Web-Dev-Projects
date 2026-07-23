"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Calendar, Loader2, Check } from "lucide-react";
import { updateProfileAction } from "@/actions/profile";
import { DatePicker } from "@/components/ui/DatePicker";
import { isValid } from "date-fns";

type WorkExperience = {
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string;
  current: boolean;
  responsibilities: string;
};

type Education = {
  highest_degree: string;
  field_of_study: string;
  institution_name: string;
  graduation_year: string;
};

type ProfileData = {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin_url: string;
  portfolio_url: string;
  work_authorization: string;
  current_title: string;
  experience_level: string;
  years_experience: string;
  skills: string[];
  industries: string[];
  work_experience: WorkExperience[];
  education: Education[];
  job_titles_seeking: string[];
  remote_preference: string;
  salary_expectation: string;
  preferred_locations: string[];
};

type ProfileFormProps = {
  initialData: ProfileData;
  onSaveSuccess: (percentage: number, missingFields: string[]) => void;
};

const AVAILABLE_INDUSTRIES = [
  "Technology & Software",
  "FinTech",
  "Healthcare & Biotech",
  "E-commerce & Retail",
  "Education & EdTech",
  "Finance & Banking",
  "Marketing & Advertising",
  "Real Estate",
  "Logistics & Supply Chain",
  "Media & Entertainment",
  "Consulting",
  "Cybersecurity",
  "Energy & CleanTech",
  "Automotive & Aerospace",
  "Telecommunications",
];

export function ProfileForm({ initialData, onSaveSuccess }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [skillInput, setSkillInput] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [customIndustryInput, setCustomIndustryInput] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [seekingTitlesInput, setSeekingTitlesInput] = useState("");
  const [preferredLocationsInput, setPreferredLocationsInput] = useState("");

  // Sync state if initialData is updated
  useEffect(() => {
    const data = { ...initialData };
    if (!data.education || data.education.length === 0) {
      data.education = [
        {
          highest_degree: "",
          field_of_study: "",
          institution_name: "",
          graduation_year: "",
        },
      ];
    }
    setFormData(data);
    setSeekingTitlesInput(data.job_titles_seeking?.join(", ") || "");
    setPreferredLocationsInput(data.preferred_locations?.join(", ") || "");
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (data: ProfileData = formData): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address.";
    }

    if (formData.phone) {
      const phoneRegex = /^\+?[0-9\s.\-()]{7,20}$/;
      if (!phoneRegex.test(formData.phone)) {
        return "Please enter a valid phone number (7 to 20 digits, spaces, parentheses, or + allowed).";
      }
    }

    if (formData.work_experience && formData.work_experience.length > 0) {
      for (const work of formData.work_experience) {
        if (!work.current && work.start_date && work.end_date) {
          const start = new Date(work.start_date);
          const end = new Date(work.end_date);
          if (isValid(start) && isValid(end) && end <= start) {
            return `End date must be after start date for ${work.company_name || "your work role"}.`;
          }
        }
      }
    }

    if (formData.education && formData.education.length > 0) {
      for (const edu of formData.education) {
        if (edu.graduation_year) {
          const year = parseInt(edu.graduation_year, 10);
          if (isNaN(year) || year < 1900 || year > 2100) {
            return `Graduation year must be between 1900 and 2100 for ${edu.institution_name || "your education entry"}.`;
          }
        }
      }
    }

    if (formData.years_experience !== null && formData.years_experience !== undefined) {
      const parsedExp = parseFloat(String(formData.years_experience));
      if (isNaN(parsedExp) || parsedExp < 0) {
        return "Years of experience cannot be negative.";
      }
    }

    if (formData.linkedin_url) {
      const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/i;
      if (!linkedinRegex.test(formData.linkedin_url)) {
        return "Please enter a valid LinkedIn URL (for example linkedin.com/in/username).";
      }
    }

    if (formData.portfolio_url) {
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
      if (!urlRegex.test(formData.portfolio_url)) {
        return "Please enter a valid Portfolio or GitHub URL.";
      }
    }

    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    setErrorMessage("");

    // Sync local inputs to formData before validation and save
    const titlesArray = seekingTitlesInput.split(",").map((title) => title.trim()).filter(Boolean);
    const locationsArray = preferredLocationsInput.split(",").map((loc) => loc.trim()).filter(Boolean);
    const syncedFormData = {
      ...formData,
      job_titles_seeking: titlesArray,
      preferred_locations: locationsArray,
    };

    const validationError = validateForm(syncedFormData);
    if (validationError) {
      setSaveStatus("error");
      setErrorMessage(validationError);
      return;
    }

    try {
      const response = await updateProfileAction(syncedFormData);

      if (!response.success) {
        throw new Error(response.error || "Failed to update profile");
      }

      setSaveStatus("success");
      onSaveSuccess(response.percentage || 100, response.missingFields || []);
      
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    } catch (err: any) {
      console.error("[ProfileForm] Save error:", err);
      setSaveStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred while saving your profile.");
    }
  };

  // Skill management
  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  // Industry management
  const handleSelectIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "Other") {
      setShowOtherInput(true);
    } else if (value) {
      if (!formData.industries.includes(value)) {
        setFormData((prev) => ({
          ...prev,
          industries: [...prev.industries, value],
        }));
      }
      e.target.value = "";
    }
  };

  const handleAddCustomIndustry = () => {
    const value = customIndustryInput.trim();
    if (value) {
      if (!formData.industries.includes(value)) {
        setFormData((prev) => ({
          ...prev,
          industries: [...prev.industries, value],
        }));
      }
      setCustomIndustryInput("");
      setShowOtherInput(false);
    }
  };

  const handleRemoveIndustry = (industryToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      industries: prev.industries.filter((ind) => ind !== industryToRemove),
    }));
  };

  // Work Experience management
  const handleWorkExpChange = (index: number, field: keyof WorkExperience, value: any) => {
    const updatedWork = [...formData.work_experience];
    updatedWork[index] = {
      ...updatedWork[index],
      [field]: value,
      // If setting currently working here to true, we clear the end date
      ...(field === "current" && value === true ? { end_date: "" } : {}),
    };
    setFormData((prev) => ({
      ...prev,
      work_experience: updatedWork,
    }));
  };

  const handleAddRole = () => {
    if (formData.work_experience.length >= 3) return; // Max 3 roles
    
    const newRole: WorkExperience = {
      company_name: "",
      job_title: "",
      start_date: "",
      end_date: "",
      current: false,
      responsibilities: "",
    };

    setFormData((prev) => ({
      ...prev,
      work_experience: [...prev.work_experience, newRole],
    }));
  };

  const handleRemoveRole = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      work_experience: prev.work_experience.filter((_, i) => i !== index),
    }));
  };

  // Education management
  const handleAddEducation = () => {
    if (formData.education.length >= 3) return; // Limit to max 3 entries
    const newEdu: Education = {
      highest_degree: "",
      field_of_study: "",
      institution_name: "",
      graduation_year: "",
    };
    setFormData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  };

  const handleRemoveEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    const updatedEdu = [...formData.education];
    if (!updatedEdu[index]) {
      updatedEdu[index] = {
        highest_degree: "",
        field_of_study: "",
        institution_name: "",
        graduation_year: "",
      };
    }
    updatedEdu[index] = {
      ...updatedEdu[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      education: updatedEdu,
    }));
  };

  // Preferred locations string input (comma-separated back and forth)
  const handleLocationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferredLocationsInput(e.target.value);
  };

  const handleLocationsBlur = () => {
    const locationsArray = preferredLocationsInput.split(",").map((loc) => loc.trim()).filter(Boolean);
    setFormData((prev) => ({
      ...prev,
      preferred_locations: locationsArray,
    }));
  };

  // Seeking job titles string input (comma-separated back and forth)
  const handleSeekingTitlesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeekingTitlesInput(e.target.value);
  };

  const handleSeekingTitlesBlur = () => {
    const titlesArray = seekingTitlesInput.split(",").map((title) => title.trim()).filter(Boolean);
    setFormData((prev) => ({
      ...prev,
      job_titles_seeking: titlesArray,
    }));
  };

  return (
    <form onSubmit={handleSave} className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-8">
      <div>
        <h2 className="text-text-primary text-[18px] font-bold leading-6">Profile Information</h2>
        <p className="text-text-secondary text-sm">
          This context is used to accurately represent you in agent interactions.
        </p>
      </div>

      <hr className="border-border" />

      {/* 1. Personal Info */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
          Personal Info
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Full Name <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="e.g. Faizan Ali"
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Email <span className="text-accent">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="e.g. +1 (555) 000-0000"
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g. City, Country"
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              LinkedIn URL
            </label>
            <input
              type="url"
              name="linkedin_url"
              value={formData.linkedin_url}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/username"
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Portfolio / GitHub
            </label>
            <input
              type="url"
              name="portfolio_url"
              value={formData.portfolio_url}
              onChange={handleInputChange}
              placeholder="https://github.com/username"
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Work Authorization
            </label>
            <select
              name="work_authorization"
              value={formData.work_authorization}
              onChange={handleInputChange}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_10px_center] bg-[size:20px] bg-no-repeat"
            >
              <option value="">Select Work Auth</option>
              <option value="Citizen">Citizen</option>
              <option value="Permanent Resident">Permanent Resident</option>
              <option value="Visa Required">Visa Required</option>
            </select>
          </div>
        </div>
      </div>

      <hr className="border-border" />

      {/* 2. Professional Info */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
          Professional Info
        </h3>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Current/Recent Job Title <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              name="current_title"
              value={formData.current_title}
              onChange={handleInputChange}
              placeholder="e.g. Frontend Engineer"
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Experience Level <span className="text-accent">*</span>
              </label>
              <select
                name="experience_level"
                value={formData.experience_level}
                onChange={handleInputChange}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_10px_center] bg-[size:20px] bg-no-repeat"
                required
              >
                <option value="">Select Level</option>
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Years of Experience <span className="text-accent">*</span>
              </label>
              <input
                type="number"
                name="years_experience"
                value={formData.years_experience}
                onChange={handleInputChange}
                placeholder="e.g. 4.5"
                min="0"
                step="0.1"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                required
              />
            </div>
          </div>

          {/* Skills Input */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add a skill"
                className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="bg-surface border border-border text-text-primary hover:bg-surface-secondary px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Add
              </button>
            </div>

            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 bg-accent-light text-accent text-xs px-3 py-1 rounded-full font-medium border border-accent/20"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-accent/70 hover:text-accent focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Industries Input */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Industries Worked In (Optional)
            </label>
            
            <div className="flex flex-col gap-3">
              <div className="relative">
                <select
                  onChange={handleSelectIndustryChange}
                  defaultValue=""
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_10px_center] bg-[size:20px] bg-no-repeat"
                >
                  <option value="">Select or add an industry...</option>
                  {AVAILABLE_INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind} disabled={formData.industries.includes(ind)}>
                      {ind}
                    </option>
                  ))}
                  <option value="Other">Other...</option>
                </select>
              </div>

              {showOtherInput && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customIndustryInput}
                    onChange={(e) => setCustomIndustryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomIndustry();
                      }
                    }}
                    placeholder="Enter custom industry..."
                    className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomIndustry}
                    className="bg-accent text-accent-foreground hover:bg-accent-dark px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtherInput(false);
                      setCustomIndustryInput("");
                    }}
                    className="bg-surface border border-border text-text-primary hover:bg-surface-secondary px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {formData.industries.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.industries.map((ind) => (
                  <span
                    key={ind}
                    className="inline-flex items-center gap-1 bg-accent-light text-accent text-xs px-3 py-1 rounded-full font-medium border border-accent/20"
                  >
                    {ind}
                    <button
                      type="button"
                      onClick={() => handleRemoveIndustry(ind)}
                      className="text-accent/70 hover:text-accent focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <hr className="border-border" />

      {/* 3. Work Experience */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
            Work Experience
          </h3>
          {formData.work_experience.length < 3 && (
            <button
              type="button"
              onClick={handleAddRole}
              className="text-accent hover:text-accent-dark flex items-center gap-1 text-sm font-semibold transition-colors"
            >
              <Plus className="h-4 w-4" /> Add role
            </button>
          )}
        </div>

        {formData.work_experience.length === 0 ? (
          <p className="text-text-muted text-sm italic py-2">No work experience added yet.</p>
        ) : (
          <div className="space-y-6">
            {formData.work_experience.map((work, idx) => (
              <div
                key={idx}
                className="border border-border rounded-xl p-5 space-y-4 relative bg-surface-secondary/50"
              >
                {formData.work_experience.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(idx)}
                    className="absolute top-4 right-4 text-text-muted hover:text-error transition-colors"
                    title="Remove Role"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={work.company_name}
                      onChange={(e) => handleWorkExpChange(idx, "company_name", e.target.value)}
                      placeholder="e.g. Vercel"
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                      required
                    />
                  </div>

<div className="space-y-1">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Job Titles Seeking <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={seekingTitlesInput}
              onChange={(e) => setSeekingTitlesInput(e.target.value)}
              placeholder="e.g. Frontend Engineer, React Developer (comma-separated)"
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              required
            />
          </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Start Date
                    </label>
                    <DatePicker
                      value={work.start_date}
                      onChange={(date) => handleWorkExpChange(idx, "start_date", date)}
                      placeholder="Start Date"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        End Date
                      </label>
                      <label className="flex items-center gap-1 text-xs text-text-secondary font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={work.current}
                          onChange={(e) => handleWorkExpChange(idx, "current", e.target.checked)}
                          className="rounded text-accent focus:ring-accent border-border-muted"
                        />
                        Currently working here
                      </label>
                    </div>
                    
                    {work.current ? (
                      <input
                        type="text"
                        value="Present"
                        disabled
                        className="w-full bg-surface-muted border border-border rounded-lg px-3 py-2 text-sm text-text-secondary cursor-not-allowed opacity-75"
                      />
                    ) : (
                      <DatePicker
                        value={work.end_date}
                        onChange={(date) => handleWorkExpChange(idx, "end_date", date)}
                        placeholder="End Date"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Key Responsibilities
                  </label>
                  <textarea
                    value={work.responsibilities}
                    onChange={(e) => handleWorkExpChange(idx, "responsibilities", e.target.value)}
                    placeholder="Describe your achievements and daily tasks..."
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent min-h-[100px]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className="border-border" />

      {/* 4. Education */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
            Education
          </h3>
          {formData.education.length < 3 && (
            <button
              type="button"
              onClick={handleAddEducation}
              className="text-accent hover:text-accent-dark flex items-center gap-1 text-sm font-semibold transition-colors"
            >
              <Plus className="h-4 w-4" /> Add education
            </button>
          )}
        </div>

        {formData.education.length === 0 ? (
          <p className="text-text-muted text-sm italic py-2">No education records added yet.</p>
        ) : (
          <div className="space-y-6">
            {formData.education.map((edu, idx) => (
              <div
                key={idx}
                className="border border-border rounded-xl p-5 space-y-4 relative bg-surface-secondary/50"
              >
                {formData.education.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(idx)}
                    className="absolute top-4 right-4 text-text-muted hover:text-error transition-colors"
                    title="Remove Education"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Highest Degree {idx === 0 && <span className="text-accent">*</span>}
                    </label>
                    <select
                      value={edu.highest_degree || ""}
                      onChange={(e) => handleEducationChange(idx, "highest_degree", e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_10px_center] bg-[size:20px] bg-no-repeat"
                      required={idx === 0}
                    >
                      <option value="">Select Degree</option>
                      <option value="High School">High School</option>
                      <option value="Associate">Associate Degree</option>
                      <option value="Bachelor's">Bachelor's Degree</option>
                      <option value="Master's">Master's Degree</option>
                      <option value="PhD">PhD / Doctorate</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Field of Study {idx === 0 && <span className="text-accent">*</span>}
                    </label>
                    <input
                      type="text"
                      value={edu.field_of_study || ""}
                      onChange={(e) => handleEducationChange(idx, "field_of_study", e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                      required={idx === 0}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Institution Name {idx === 0 && <span className="text-accent">*</span>}
                    </label>
                    <input
                      type="text"
                      value={edu.institution_name || ""}
                      onChange={(e) => handleEducationChange(idx, "institution_name", e.target.value)}
                      placeholder="E.g. State University"
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                      required={idx === 0}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Graduation Year {idx === 0 && <span className="text-accent">*</span>}
                    </label>
                    <input
                      type="number"
                      value={edu.graduation_year || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d+$/.test(val)) {
                          handleEducationChange(idx, "graduation_year", val);
                        }
                      }}
                      placeholder="YYYY"
                      min="1900"
                      max="2100"
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                      required={idx === 0}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className="border-border" />

      {/* 5. Job Preferences */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
          Job Preferences
        </h3>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Job Titles Seeking <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={seekingTitlesInput}
              onChange={(e) => setSeekingTitlesInput(e.target.value)}
              placeholder="e.g. Frontend Engineer, React Developer (comma-separated)"
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Remote Preference <span className="text-accent">*</span>
              </label>
              <select
                name="remote_preference"
                value={formData.remote_preference}
                onChange={handleInputChange}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_10px_center] bg-[size:20px] bg-no-repeat"
                required
              >
                <option value="">Select Option</option>
                <option value="Remote">Remote</option>
                <option value="Onsite">Onsite</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Any">Any</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Salary Expectation (Optional)
              </label>
              <input
                type="text"
                name="salary_expectation"
                value={formData.salary_expectation}
                onChange={handleInputChange}
                placeholder="E.g. $120k+"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              />
            </div>
          </div>

<div className="space-y-1">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Preferred Locations (Optional)
            </label>
            <input
              type="text"
              value={preferredLocationsInput}
              onChange={(e) => setPreferredLocationsInput(e.target.value)}
              placeholder="E.g. New York, London (comma-separated)"
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-error/10 border border-error/20 text-error rounded-lg text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* Save Button */}
      <button
        type="submit"
        disabled={saveStatus === "saving"}
        className="w-full bg-accent text-accent-foreground text-sm font-semibold py-2.5 rounded-lg hover:bg-accent-dark transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
      >
        {saveStatus === "saving" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving Profile...
          </>
        ) : saveStatus === "success" ? (
          <>
            <Check className="h-4 w-4" />
            Profile Saved!
          </>
        ) : (
          "Save Profile"
        )}
      </button>
    </form>
  );
}
