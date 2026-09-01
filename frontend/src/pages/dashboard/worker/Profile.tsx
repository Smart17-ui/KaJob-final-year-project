const Profile = () => {
  return (
    <div className="space-y-6">

      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your worker profile.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">

        <h2 className="text-base font-semibold text-slate-900">
          Worker Profile
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Your profile information will appear here.
        </p>

      </section>

    </div>
  );
};

export default Profile;