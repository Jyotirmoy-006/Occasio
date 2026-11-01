export interface OnboardingFormValues {
  eventName: string;
  eventDate: string;
  city: string;
  budgetMinorUnits: number;
  todayStr: string;
}

export function validateOnboardingField(
  field: string,
  values: OnboardingFormValues,
  existingErrors: Record<string, string>,
): Record<string, string> {
  const newErrors = { ...existingErrors };

  if (field === 'eventName') {
    if (!values.eventName.trim()) newErrors.eventName = 'Event name is required';
    else delete newErrors.eventName;
  }
  if (field === 'eventDate') {
    if (!values.eventDate) newErrors.eventDate = 'Event date is required';
    else if (values.eventDate <= values.todayStr) newErrors.eventDate = 'Date must be in the future';
    else delete newErrors.eventDate;
  }
  if (field === 'city') {
    if (!values.city.trim()) newErrors.city = 'City or region is required';
    else delete newErrors.city;
  }
  if (field === 'budget') {
    if (values.budgetMinorUnits <= 0) newErrors.budget = 'Please enter a valid budget amount';
    else delete newErrors.budget;
  }

  return newErrors;
}
