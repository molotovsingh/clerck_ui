# Backend Request: Make `matter_class` extensible

**From:** Frontend team
**Priority:** Medium
**Affects:** Matter creation, compliance updates

---

## Problem

The allowed `matter_class` values are hardcoded to exactly 4 options in
`app/domain/compliance_constants.py` (lines 15-25):

```
general_dispute, debt_recovery, employment_dispute, regulatory_enforcement
```

Any other value is rejected with `COMPLIANCE_MATTER_CLASS_INVALID` by the
validation in `app/services/workflow/compliance_policy_validation.py` (line 29).

Real litigation covers far more than these four categories — family law,
IP disputes, insolvency, criminal defense, tax disputes, construction,
medical negligence, etc. Forcing every matter into one of four buckets
makes the platform unusable for diverse practices.

## What we need

1. **Either** make `matter_class` a free-text field (with normalization
   as you already do) and drop the allowlist check, **or** move the
   allowed list to a config/database table so firms can define their own.

2. The `DEFAULT_RETENTION_POLICY_BY_MATTER_CLASS` mapping (line 29-34
   in `compliance_constants.py`) also needs a fallback for classes not
   in the map — currently any new class would KeyError.

3. The `/compliance/options` endpoint should continue to return the
   available classes (whether from config or DB) so the frontend can
   populate a dropdown dynamically.

## Files to change

| File | What |
|------|------|
| `app/domain/compliance_constants.py` | Remove hardcoded tuple or load from config |
| `app/services/workflow/compliance_policy_validation.py` | Remove or relax the `not in MATTER_CLASSES` guard |
| `app/services/workflow/compliance_constants.py` | Add a fallback retention policy for unknown classes |
| `tests/services/test_compliance_policy.py` | Update tests for new behavior |

## Frontend workaround (current)

Until this is fixed, the frontend hardcodes the 4 allowed values in a
dropdown so users don't hit the 400 error. Once the backend is updated,
we'll switch to fetching allowed classes from `/compliance/options`
dynamically.
