import { WfUserData } from '../workflow-cockpit';

export class WfUser implements WfUserData {
  id!: string;
  username!: string;
  subject!: string;
  email!: string;
  fullname!: string;
  locale!: string;
  tenantName!: string;
  tenantLocale!: string;
  token!: string;
}
