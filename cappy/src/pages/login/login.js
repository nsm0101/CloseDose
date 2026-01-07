import "../../styles.css";

const params = location.search ? location.search : "";
location.replace(`/cappy/auth/${params}`);
