import { Link } from "react-router-dom";
import {
    HeartPulse,
    ShieldCheck,
    Ambulance,
    Users,
} from "lucide-react";

export default function AboutUs() {
    return (
        <div className="bg-[#FAF8F3]">

            {/* Hero */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">

                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left */}
                    <div>

                        <span className="inline-block px-5 py-2 rounded-full bg-green-100 text-[#16332B] font-'Cormorant Garamond'">
                            About CareConnect
                        </span>

                        <h1
                            className="mt-6 text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-[#16332B]"
                            style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                            Caring For Your
                            <span className="text-[#3E7C59]">
                                {" "}Health{" "}
                            </span>
                            Every Step
                            <br />
                            Of The Way.
                        </h1>

                        <p className="mt-8 text-lg leading-8 text-gray-600">
                            CareConnect is a modern healthcare platform designed to
                            connect patients with experienced doctors, emergency
                            ambulance services, online medicine ordering and
                            seamless appointment booking.
                        </p>

                        <p className="mt-5 text-lg leading-8 text-gray-600">
                            Our mission is to make quality healthcare simple,
                            affordable and available for everyone through secure
                            digital technology.
                        </p>

                        <div className="flex gap-5 mt-10">

                            <Link
                                to="/patient/doctors"
                                className="bg-[#16332B] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#0F231D] transition"
                            >
                                Find Doctors
                            </Link>

                            <Link
                                to="/patient/appointments"
                                className="border-2 border-[#16332B] text-[#16332B] px-8 py-4 rounded-xl font-semibold hover:bg-[#16332B] hover:text-white transition"
                            >
                                Book Now
                            </Link>

                        </div>

                    </div>

                    {/* Right */}

                    <div className="relative">

                        <div className="absolute top-8 right-8 w-[380px] h-[480px] rounded-3xl bg-[#3E7C59]"></div>

                        <img
                            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=900&q=80"
                            alt="Doctor"
                            className="relative rounded-3xl shadow-2xl w-full max-w-md ml-auto"
                        />

                        <div className="absolute bottom-8 -left-6 bg-white shadow-xl rounded-2xl p-6">

                            <h2 className="text-4xl font-bold text-[#16332B]">
                                20+
                            </h2>

                            <p className="text-gray-500">
                                Years of Medical Excellence
                            </p>

                        </div>

                    </div>

                </div>

            </section>

            {/* Statistics */}

            <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-20">

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

                    <div className="bg-white rounded-3xl p-8 shadow-md">

                        <Users size={45} className="text-[#3E7C59]" />

                        <h2 className="text-4xl font-bold mt-5 text-[#16332B]">
                            250+
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Specialist Doctors
                        </p>

                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-md">

                        <HeartPulse
                            size={45}
                            className="text-[#3E7C59]"
                        />

                        <h2 className="text-4xl font-bold mt-5 text-[#16332B]">
                            15K+
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Happy Patients
                        </p>

                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-md">

                        <Ambulance
                            size={45}
                            className="text-[#3E7C59]"
                        />

                        <h2 className="text-4xl font-bold mt-5 text-[#16332B]">
                            24/7
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Emergency Service
                        </p>

                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-md">

                        <ShieldCheck
                            size={45}
                            className="text-[#3E7C59]"
                        />

                        <h2 className="text-4xl font-bold mt-5 text-[#16332B]">
                            100%
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Secure Healthcare
                        </p>

                    </div>

                </div>

            </section>

            {/* About */}

            <section className="bg-white py-24">

                <div className="max-w-7xl mx-auto px-6 lg:px-10">

                    <div className="grid lg:grid-cols-2 gap-20 items-center">

                        <img
                            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=80"
                            className="rounded-3xl shadow-xl"
                            alt="Healthcare"
                        />

                        <div>

                            <span className="text-[#3E7C59] font-semibold uppercase tracking-wider">
                                Who We Are
                            </span>

                            <h2 className="text-5xl font-bold mt-4 text-[#16332B]"
                                style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                Dedicated To Better
                                Healthcare For Everyone
                            </h2>


                            <p className="mt-8 text-lg text-gray-600 leading-8">
                                CareConnect combines technology and healthcare to
                                provide patients with faster access to trusted doctors,
                                medicine delivery, ambulance booking, and secure
                                healthcare management.
                            </p>

                            <p className="mt-5 text-lg text-gray-600 leading-8">
                                We believe everyone deserves quality medical care,
                                regardless of where they live. Our platform helps
                                patients receive timely treatment while simplifying
                                healthcare management through a single digital
                                solution.
                            </p>

                        </div>

                    </div>

                </div>

            </section>

        </div>
    );
}