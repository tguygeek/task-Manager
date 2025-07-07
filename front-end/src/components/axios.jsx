import axios from "axios";

const instance = axios.create({
  baseURL : 'http://localhost:8000',
  withCredentials : true
});
// const Exemple = () => {
//   useEffect(() => {
//     axios.get("http://127.0.0.1:8000/api/taches")
//       .then((res) => console.log(res.data))
//       .catch((err) => console.error(err));
//   }, []);

//   return <h1>Appels API vers Laravel</h1>;
// };

export default instance;
