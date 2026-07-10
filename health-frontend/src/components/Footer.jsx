import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-[#16332B] mt-28 text-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-4 gap-10">

                <div>
                    <h2 className="text-2xl font-medium font-[Georgia,serif]">✦  CareConnect.</h2>
                    <p className="text-white/60 mt-4 font-[system-ui,sans-serif] text-[15px] leading-6">
                        Your trusted digital healthcare partner.
                    </p>
                </div>

                <div className="font-[system-ui,sans-serif]">
                    <h3 className="font-medium mb-4 font-[Georgia,serif] text-lg">Services</h3>
                    <ul className="space-y-2 text-white/60 text-[15px]">
                        <li>
                            <Link to="/patient/doctors" className="hover:text-white transition">
                                Doctors
                            </Link>
                        </li>
                        <li>
                            <Link to="/patient/products" className="hover:text-white transition">
                                Medicines
                            </Link>
                        </li>
                        <li>
                            <Link to="/patient/ambulance" className="hover:text-white transition">
                                Ambulance
                            </Link>
                        </li>
                        <li>
                            <Link to="/patient/appointments" className="hover:text-white transition">
                                Appointments
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="font-[system-ui,sans-serif]">
                    <h3 className="font-medium mb-4 font-[Georgia,serif] text-lg">Company</h3>
                    <ul className="space-y-2 text-white/60 text-[15px]">
                        <li>
                            <Link to="/patient/AboutUs" className="hover:text-white transition">
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link to="/patient/Contacts" className="hover:text-white transition">
                                Support
                            </Link>
                        </li>
                        <li className="text-white/60">Terms & Conditions</li>
                    </ul>
                </div>

                <div className="font-[system-ui,sans-serif]">
                    <h3 className="font-medium mb-4 font-[Georgia,serif] text-lg">Contact</h3>
                    <p className="text-white/60 text-[15px]">support@careconnect.com</p>
                    <p className="text-white/60 mt-3 text-[15px]">+91 99999 00000</p>
                </div>

            </div>

            <div className="border-t border-white/10 py-6 text-center text-white/50 font-[system-ui,sans-serif] text-sm">
                © 2026 CareConnect. All Rights Reserved.
            </div>
        </footer>
    );
}