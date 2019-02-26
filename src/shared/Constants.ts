export class Constants {
    public static OFISIM_IK_ENDPOINT = 'https://ik.ofisim.com/api/record/find/rehber';
    public static GET_TIME_RECORDS = 'https://ik.ofisim.com/api/record/find/timetracker_items';
    public static CREATE_TIME_RECORD = 'https://ik.ofisim.com/api/record/create/timetracker_items?timezone_offset=180';
    public static TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCIsImlzcyI6IjBmIXMhbUpXVCIsImlhdCI6IjE1NTEyMDMzOTAiLCJuYmYiOjE1NTEyMDM2OTQsImV4cCI6MTU1MjQxMzI5NCwiYWlvIjoiNDJKZ1lMQjcrMmVWeWkydTFxdktHZlVWcStzM3NWK1oxbXlsNC9va0o1VXZ2enp6eHpjQSIsImFtciI6InB3ZCIsImNfaGFzaCI6Ii13bGY0RU9WSmQ0eXRiNG96VGdzRGciLCJmYW1pbHlfbmFtZSI6Ik9uYXkiLCJnaXZlbl9uYW1lIjoiU2VtaWgiLCJpcGFkZHIiOiIyMTIuMjUzLjExMi4yMjEiLCJuYW1lIjoiU2VtaWggT25heSAoRVRJWUEpIiwibm9uY2UiOiI2MzY4NjgwMDQxNzUwODIwOTYuTTJJMk5EaG1ZMlF0TXpWaE5TMDBPVFJqTFdKbU5XRXRaR05sWm1WaU5XTXlOamhrT1Rnd1lUVmlORFl0TURrM1pDMDBOekUxTFRneU9HUXROV0ZsTm1Rd01XUXhPR016Iiwib2lkIjoiZDQwNmRmMzEtZTcxOC00MjhjLWFmOTItNmM1NzNkMDIyZDhmIiwib25wcmVtX3NpZCI6IlMtMS01LTIxLTIzMDA4MjI2MTYtMjgyMjg5MTg1MS00MTAyNDA2NjkxLTI4MTMxIiwibmFtZWlkIjoiUUZiRC1yR2lrUVVXVmJpR05CNU9XMTNwajVVNlItSGItTzcxOFRCd2ZyQSIsInRpZCI6IjkwM2Y3YmU4LTFhNmUtNGFiMS1hMWE1LWRmNTA4ZDg3ZmUyYyIsInVwbiI6InNlbWloLm9uYXlAZXRpeWEuY29tIiwidXRpIjoiQjNiSGN4ZnpJazJVblFlU0ZPWWlBQSIsInZlciI6IjEuMCIsInVuaXF1ZV9uYW1lIjoic2VtaWgub25heUBldGl5YS5jb20iLCJ1c2VyX2lkIjoiOTcyMiIsInRlbmFudF9pZCI6IjYxNzUifQ.sp7YuJCth0duisWwIW8ZF7GdYlGaZkUPtD4VUslqYkU';
    public static FIELDS = ["owner",
        "related_timetracker",
        "saat",
        "aciklama",
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
        "tarih",
        "gorev",
        "faturalanabilir_faturalanmaz",
        "proje",
        "izindir",
        "opportunity",
        "proje.projeler.proje_kisa_kodu",
        "opportunity.firsatlar.opportunity_name"];
}
