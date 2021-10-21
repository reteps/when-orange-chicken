function MyApp({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        body,
        html {
          padding: 0;
          margin: 0;
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
