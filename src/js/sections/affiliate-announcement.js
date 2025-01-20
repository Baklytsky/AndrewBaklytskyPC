class AffiliateAnnouncement extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    const searchParams = new URLSearchParams(window.location.search)
    const idFromParams = searchParams.get('rfsn')?.split('.')[0];
    this.id = idFromParams || localStorage.getItem('rfsn_v4_aid');
    if (!this.id) return;
    window.setCSSProperties();
    this.getRepresentative (this.id)
      .then(() => {
        if (!this.affiliate) return;
        this.buildBar();
      }).then(() => window.setCSSProperties())
  }

  async getRepresentative(id) {
    try {
      const response = await fetch(`https://obagi-api.westus.cloudapp.azure.com/api/affiliate/refersion?id=${id}`);
      this.affiliate = await response.json();
      return this.affiliate;
    } catch (e) {
      console.log(e);
      window.setCSSProperties();
      return this.affiliate = null;
    }
  }

  buildBar() {
    const { status, company_name } = this.affiliate;
    this.content = this.querySelector('[data-text-content]');

    if (status !== 'ACTIVE' || !this.content) return;
    const inner = this.content.innerHTML;

    if (inner.includes("[[company_name]]")) {
      this.content.innerHTML = inner.replace("[[company_name]]", company_name);
      this.classList.remove('hidden');
    }
  }
}

customElements.define('affiliate-announcement', AffiliateAnnouncement);

// const affiliateObjExample = {
//   id: 8127141,
//   offer_id: 114343,
//   status: "ACTIVE",
//   first_name: "James",
//   last_name: "Ku",
//   company_name: "Test Medspa",
//   email: "james.ku@obagi.com",
//   link: "https://www.obagi.com/?rfsn=8127141.a5edaeb&utm_source=refersion&utm_medium=affiliate&utm_campaign=8127141.a5edaeb",
//   custom_fields: [
//     {
//       label: "Obagi Account Number (ID)",
//       value: "1-1234567890"
//     },
//     {
//       label: "Coupon Code",
//       value: "testmedspa"
//     }
//   ]
// }
